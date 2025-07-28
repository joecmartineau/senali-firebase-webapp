# Firebase Configuration Setup

## Security Note
The `google-services.json` file has been moved to `.gitignore` to follow security best practices, even though Firebase Android API keys are designed to be public.

## Setup Instructions

### For Development/Deployment:

1. **Download your Firebase configuration**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`senali-235fb`)
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click on the Android app
   - Click "Download google-services.json"

2. **Place the file**:
   - Copy the downloaded `google-services.json` to `android/app/google-services.json`
   - The file will be ignored by git but used by the build process

### Template Available
A template file is available at `android/app/google-services.json.template` for reference.

## Why This Change?
- **Best Practice**: Configuration files should not be committed to version control
- **No Security Risk**: Firebase Android API keys are public by design and restricted by package name
- **Clean Repository**: Keeps sensitive configuration separate from source code