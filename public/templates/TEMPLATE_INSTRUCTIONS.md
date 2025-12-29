# Word Template Instructions

## How to Create Your Word Template

1. **Create a Word document** with your desired design and formatting
2. **Use placeholder variables** in the format `{variableName}` where you want dynamic content
3. **Save the file** as `appointment-letter-template.docx` in this folder

## Available Template Variables

Use these placeholders in your Word document:

- `{employeeName}` - Employee's full name
- `{position}` - Job position/title
- `{department}` - Department name
- `{startDate}` - Employment start date (formatted)
- `{salary}` - Annual salary (formatted with commas)
- `{companyName}` - Company name (defaults to "Tech Buddy Space")
- `{companyAddress}` - Company address
- `{reportingManager}` - Manager's name
- `{hrName}` - HR person's name
- `{hrTitle}` - HR person's title
- `{currentDate}` - Today's date (formatted)
- `{workLocation}` - Work location
- `{probationPeriod}` - Probation period duration

## Example Template Content

```
{companyName}
{companyAddress}

Date: {currentDate}

Dear {employeeName},

We are pleased to offer you the position of {position} in the {department} department.

Position Details:
- Position: {position}
- Department: {department}
- Start Date: {startDate}
- Annual Salary: ${salary}
- Reporting Manager: {reportingManager}
- Work Location: {workLocation}
- Probation Period: {probationPeriod}

Sincerely,
{hrName}
{hrTitle}
{companyName}
```

## Steps to Use:

1. Create your Word template with the above variables
2. Save it as `appointment-letter-template.docx` in this folder
3. Use the API endpoint `/api/generate-appointment-docx` to generate documents
4. The API will replace all variables with actual data and return a Word document

## Converting to PDF (Optional)

If you need PDF output, you can:
1. Use the Word document API to generate .docx files
2. Convert them to PDF using additional libraries like `libreoffice-convert`
3. Or continue using the Puppeteer API for direct PDF generation