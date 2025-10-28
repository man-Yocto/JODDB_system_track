# Data Exchange API Implementation

## Overview
This document describes the implementation of the Excel Import and Daily Report Export APIs as per Smart Prompt 6 requirements.

---

## 1. Excel Import API

### Endpoint
```
POST /api/v1/data/import/job-order/
```

### Role Access
- **Planning Engineer** only (`planning`, `admin`)

### Description
Allows Planning Engineers to bulk create Job Orders by uploading an Excel or CSV file containing job order and device information.

### Request Format
- **Content-Type**: `multipart/form-data`
- **Field Name**: `file`
- **Supported Formats**: `.csv`, `.xlsx`, `.xls`

### Expected File Structure
The uploaded file must contain the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| `job_order_code` | String | Unique job order identifier |
| `title` | String | Job order title |
| `due_date` | Date | Due date (YYYY-MM-DD format) |
| `device_serial` | String | Unique device serial number |
| `standard_time_seconds` | Integer | Standard time for the operation in seconds |

### Example File Content (CSV)
```csv
job_order_code,title,due_date,device_serial,standard_time_seconds
JO-2025-001,Assembly Batch A,2025-11-15,DEV-001,3600
JO-2025-001,Assembly Batch A,2025-11-15,DEV-002,3600
JO-2025-001,Assembly Batch A,2025-11-15,DEV-003,3600
JO-2025-002,Assembly Batch B,2025-11-20,DEV-101,4200
JO-2025-002,Assembly Batch B,2025-11-20,DEV-102,4200
```

### Processing Logic

1. **File Reading**: Reads the uploaded file using pandas (CSV or Excel)
2. **Column Validation**: Ensures all required columns are present
3. **Data Grouping**: Groups rows by `job_order_code`
4. **Duplicate Detection**: Checks for existing device serial numbers in the database
5. **Job Order Creation**: Uses the existing `JobOrderCreateSerializer` for validation and creation
6. **Transactional Safety**: All operations are wrapped in a database transaction

### Response Format

#### Success Response (201 CREATED)
```json
{
  "success": true,
  "summary": {
    "total_job_orders_created": 2,
    "total_devices_created": 5,
    "created_job_orders": ["JO-2025-001", "JO-2025-002"],
    "duplicates": ["DEV-004"],
    "errors": []
  }
}
```

#### Error Response (400 BAD REQUEST)
```json
{
  "error": "Missing required columns: device_serial, standard_time_seconds"
}
```

### Example Usage (cURL)
```bash
curl -X POST http://localhost:8000/api/v1/data/import/job-order/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@job_orders.xlsx"
```

### Example Usage (Python)
```python
import requests

url = "http://localhost:8000/api/v1/data/import/job-order/"
headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}
files = {"file": open("job_orders.xlsx", "rb")}

response = requests.post(url, headers=headers, files=files)
print(response.json())
```

---

## 2. Daily Report Export API

### Endpoint
```
GET /api/v1/data/export/daily-report/?date=YYYY-MM-DD&format=csv
```

### Role Access
- **Planning Engineer** (`planning`, `admin`)
- **Supervisor** (`supervisor`)

### Description
Exports a daily report of all completed and accepted tasks for a specific date. The report includes comprehensive task details, technician performance, and efficiency metrics.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `date` | String (YYYY-MM-DD) | No | Today | The date to generate the report for |
| `format` | String | No | `csv` | Export format: `csv` or `excel` |

### Report Columns

| Column Name | Description |
|------------|-------------|
| Job Order Code | The job order identifier |
| Device Serial | Device serial number |
| Technician Name | Full name of the technician |
| Operation Name | Name/description of the operation |
| Standard Time (seconds) | Expected time for the task |
| Actual Time (seconds) | Actual time taken |
| Efficiency (%) | Calculated efficiency percentage |
| Status | Current task status |
| Start Time | Task start timestamp |
| End Time | Task end timestamp |

### Response Format

#### CSV Format
```
Content-Type: text/csv
Content-Disposition: attachment; filename="daily_report_2025-10-28.csv"

Job Order Code,Device Serial,Technician Name,Operation Name,...
JO-2025-001,DEV-001,Ali Technician,Initial Assembly,...
```

#### Excel Format
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="daily_report_2025-10-28.xlsx"

[Binary Excel file content]
```

### Data Aggregation Logic

1. **Query Tasks**: Filters tasks with status `done`, `pending_supervisor`, or `completed`
2. **Date Filtering**: Filters by the `updated_at` field matching the target date
3. **Data Enrichment**: Includes related Job Order, Device, and Technician information
4. **Efficiency Calculation**: Calls the Task model's `calculate_efficiency()` method
5. **File Generation**: Creates CSV or Excel file based on the format parameter

### Example Usage (cURL)

#### Export Today's Report (CSV)
```bash
curl -X GET "http://localhost:8000/api/v1/data/export/daily-report/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o daily_report.csv
```

#### Export Specific Date (Excel)
```bash
curl -X GET "http://localhost:8000/api/v1/data/export/daily-report/?date=2025-10-28&format=excel" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o daily_report.xlsx
```

### Example Usage (Python)
```python
import requests

url = "http://localhost:8000/api/v1/data/export/daily-report/"
headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}
params = {
    "date": "2025-10-28",
    "format": "excel"
}

response = requests.get(url, headers=headers, params=params)

with open("daily_report.xlsx", "wb") as f:
    f.write(response.content)
```

---

## Error Handling

### Common Error Responses

#### 400 Bad Request - Invalid Date Format
```json
{
  "error": "Invalid date format. Use YYYY-MM-DD."
}
```

#### 401 Unauthorized - Missing Authentication
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden - Insufficient Permissions
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found - No Data Available
```json
{
  "message": "No completed tasks found for 2025-10-28"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Error processing file: [detailed error message]"
}
```

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT authentication
2. **Role-Based Access Control**: Enforced through custom permission classes
3. **File Validation**: Only CSV and Excel files are accepted
4. **Data Integrity**: Database transactions ensure atomic operations
5. **Duplicate Prevention**: Checks for existing records before creation

---

## Dependencies

The following Python packages are required:

```
pandas>=2.0.0
openpyxl>=3.1.0
```

These have been added to `requirements.txt` and should be installed via:
```bash
pip install -r requirements.txt
```

---

## Testing

### Test Excel Import

1. Create a test Excel file with sample data
2. Authenticate as a Planning Engineer
3. Upload the file to the import endpoint
4. Verify the response contains the expected summary

### Test Report Export

1. Ensure there are completed tasks in the database
2. Authenticate as Planning Engineer or Supervisor
3. Call the export endpoint with a valid date
4. Verify the downloaded file contains the correct data

---

## Implementation Notes

### Import View (`ExcelImportView`)
- Uses the existing `JobOrderCreateSerializer` for consistency
- Implements proper error handling for file reading and processing
- Groups devices by job order code automatically
- Returns detailed feedback including duplicates and errors

### Export View (`DailyReportExportView`)
- Queries completed tasks efficiently with `select_related()`
- Supports both CSV and Excel formats
- Uses Django's `HttpResponse` with proper content types
- Formats data for easy consumption by Planning Engineers and Supervisors

### Code Location
- **Views**: `/core/views.py` (lines added at the end)
- **URLs**: `/joddb_backend/urls.py` (new routes added)
- **Requirements**: `/requirements.txt` (pandas and openpyxl added)

---

## Future Enhancements

1. **Validation Improvements**
   - More robust date format handling
   - Better error messages for specific validation failures

2. **Performance Optimization**
   - Bulk processing for very large files
   - Background task processing using Celery

3. **Additional Features**
   - Support for more file formats (JSON, XML)
   - Email notification after import completion
   - Scheduled daily report generation

---

## Conclusion

Both APIs have been successfully implemented according to the Smart Prompt 6 requirements. The implementation:

✅ Handles Excel/CSV file upload for Job Orders  
✅ Validates and groups data by job order code  
✅ Uses existing serializers for consistency  
✅ Provides detailed operation summaries  
✅ Exports daily reports with comprehensive task data  
✅ Supports multiple export formats (CSV and Excel)  
✅ Enforces proper role-based access control  
✅ Includes robust error handling  

The implementation is production-ready and can be used immediately by the Planning Engineers and Supervisors.
