# Resume Files Directory

Place your resume files in this directory to enable download functionality.

## File Naming Convention

Your resume files should include "resume" in the filename:

- `resume.pdf` - PDF format (recommended)
- `resume.docx` - Microsoft Word format
- `daniel-koryat-resume.pdf` - Alternative naming
- `my-resume.docx` - Alternative naming

## Supported Formats

- **PDF** (.pdf) - Most widely supported
- **Word** (.docx) - Microsoft Word format (always available)
- **Text** (.txt) - Plain text format

## How It Works

1. Upload your resume files to this directory
2. The contact form will automatically detect available formats
3. Visitors can download your resume directly from the website
4. Files are served securely through the `/api/resume` endpoint

## Important Notes

- **DOCX Format**: The system will always try to provide DOCX format if requested
- **Fallback**: If a specific format isn't found, it will look for any file of that type
- **Security**: Only upload files you want to be publicly accessible

## Example Files

To test the functionality, you can add:
- `resume.pdf` - Your main resume in PDF
- `resume.docx` - Your main resume in Word format
- `daniel-koryat-resume.pdf` - Alternative naming

The system will automatically detect and serve these files when users click the download buttons. 