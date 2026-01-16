# Integration Guide - Using Theme & Color URL Parameters

## For Product Managers & Integration Teams

This guide explains how to integrate the new theme and color customization feature into your external systems.

## Basic Concept

You can now customize the application's appearance by adding URL parameters before redirecting students to the academy:

```
Application URL + Theme Parameters = Customized Experience
```

## URL Parameter Format

```
http://app.ps-academy.com/?isMobile=true&token=STUDENT_TOKEN&isDarkMode=true&colorCode=%23e91e63
```

### Parameters Explained

| Parameter | Purpose | Example | Required |
|-----------|---------|---------|----------|
| `isMobile=true` | Enable mobile mode & customization | `isMobile=true` | Yes |
| `token=` | Student authentication | `token=eyJ...` | No (for guest) |
| `isDarkMode=true` | Use dark theme | `isDarkMode=true` | No (light default) |
| `colorCode=` | Primary UI color | `colorCode=%23e91e63` | No (default color) |

## Quick Start Example

### Step 1: Generate Student Token
```javascript
// Your backend generates JWT token
const token = jwt.sign(
  { userId: 33637, timestamp: Date.now() },
  SECRET_KEY,
  { expiresIn: '30d' }
);
// Result: eyJ1c2VySWQiOjMzMzYzNywidGltZXN0YW1wIjoxNzY3NTIxODY0OTYyfQ...
```

### Step 2: Choose Theme & Color
```javascript
const isDarkMode = true;              // Use dark background
const brandColor = '#e91e63';         // Pink color
```

### Step 3: Build Enrollment URL
```javascript
const baseUrl = 'https://app.ps-academy.com/';
const enrollmentUrl = `${baseUrl}?isMobile=true&token=${token}&isDarkMode=${isDarkMode}&colorCode=${encodeURIComponent(brandColor)}`;
```

### Step 4: Redirect Student
```javascript
// Open in new tab
window.open(enrollmentUrl, '_blank');

// Or redirect current page
window.location.href = enrollmentUrl;

// Or in iframe
document.getElementById('academy-frame').src = enrollmentUrl;
```

## Common Implementation Patterns

### Pattern 1: Enrollment Link
```html
<!-- Send this link to students -->
<a href="https://app.ps-academy.com/?isMobile=true&token=xyz&isDarkMode=true&colorCode=%23e91e63">
  Start Learning
</a>
```

### Pattern 2: Dynamic Redirect
```javascript
function openAcademy(studentId, studentToken) {
  const params = new URLSearchParams({
    isMobile: 'true',
    token: studentToken,
    isDarkMode: 'true',
    colorCode: '#667eea'  // Your brand color
  });
  
  window.location.href = `https://app.ps-academy.com/?${params.toString()}`;
}
```

### Pattern 3: Iframe Embedding
```html
<iframe 
  id="academy"
  src="https://app.ps-academy.com/?isMobile=true&token=xyz&isDarkMode=true&colorCode=%23e91e63"
  style="width: 100%; height: 100%; border: none;">
</iframe>

<script>
  // Update iframe source dynamically
  document.getElementById('academy').src = buildAcademyUrl(token, color);
</script>
```

### Pattern 4: React Component
```javascript
function AcademyEmbed({ studentToken, brandColor }) {
  const buildUrl = () => {
    const params = new URLSearchParams({
      isMobile: 'true',
      token: studentToken,
      isDarkMode: 'true',
      colorCode: brandColor
    });
    return `https://app.ps-academy.com/?${params.toString()}`;
  };
  
  return (
    <iframe 
      src={buildUrl()}
      style={{ width: '100%', height: '100vh' }}
      frameBorder="0"
    />
  );
}
```

## Color Code Reference

### Pre-made Color Combinations

#### Professional Colors
```
Blue:    #2196f3 or %232196f3
Purple:  #9c27b0 or %239c27b0
Teal:    #009688 or %23009688
```

#### Brand Colors
```
Red:     #f44336 or %23f44336
Pink:    #e91e63 or %23e91e63
Orange:  #ff9800 or %23ff9800
```

#### Modern Colors
```
Cyan:    #00bcd4 or %2300bcd4
Green:   #4caf50 or %234caf50
Indigo:  #3f51b5 or %233f51b5
```

## URL Encoding Notes

When building URLs in code:

### JavaScript (Automatic)
```javascript
// URLSearchParams handles encoding automatically
const params = new URLSearchParams({
  colorCode: '#e91e63'  // No need to encode
});
// Produces: colorCode=%23e91e63
```

### Manual Encoding
```javascript
// If building URL manually, encode the color
const encoded = encodeURIComponent('#e91e63');
// Result: %23e91e63

const url = `?colorCode=${encoded}`;
// Result: ?colorCode=%23e91e63
```

### Common Mistake
```javascript
// ❌ WRONG - # not encoded
const url = `?colorCode=#e91e63`;

// ✅ CORRECT - # encoded as %23
const url = `?colorCode=%23e91e63`;
```

## Real-World Scenarios

### Scenario 1: Corporate Training Platform
```
Corporate portal shows list of employees → 
Click "Go to Academy" → 
Opens academy in company brand color (dark mode, purple)
```

```javascript
const employeeUrl = (emp) => {
  return `https://academy.company.com/?isMobile=true&token=${emp.token}&isDarkMode=true&colorCode=%239c27b0`;
};
```

### Scenario 2: Exam Coaching Website
```
Student purchases course →
Receives enrollment email with link →
Link opens academy with coaching center's brand color
```

```javascript
const enrollmentEmail = (student) => {
  const url = new URLSearchParams({
    isMobile: 'true',
    token: student.token,
    isDarkMode: 'true',
    colorCode: '#667eea'  // Coaching center brand
  });
  return `${academyUrl}?${url}`;
};
```

### Scenario 3: School Management System
```
Student logs in via SMS link →
Opens in mobile browser →
Academy displays in school colors
```

```javascript
app.get('/student/academy/:token', (req, res) => {
  const schoolColor = '#00897b';  // School teal
  const url = new URLSearchParams({
    isMobile: 'true',
    token: req.params.token,
    isDarkMode: 'true',
    colorCode: schoolColor
  });
  res.redirect(`https://academy.com/?${url}`);
});
```

## Testing Before Integration

### Test 1: Basic Functionality
```
URL: ?isMobile=true&colorCode=%23e91e63
Expected: Pink color applied
```

### Test 2: Dark Mode
```
URL: ?isMobile=true&isDarkMode=true&colorCode=%23667eea
Expected: Dark background + purple color
```

### Test 3: With Token
```
URL: ?isMobile=true&token=sample_jwt&isDarkMode=true&colorCode=%234caf50
Expected: Dark + green + authenticated
```

### Test 4: Invalid Color (Fallback)
```
URL: ?isMobile=true&colorCode=invalid
Expected: Falls back to default color
```

### Test 5: Without isMobile
```
URL: ?colorCode=%23e91e63
Expected: Parameters ignored, normal desktop view
```

## Troubleshooting Integration

### Issue: Color not appearing
**Cause**: Missing or incorrect `isMobile=true`  
**Solution**: Ensure `isMobile=true` is always included in URL

### Issue: Dark mode not working
**Cause**: `isDarkMode` not set or incorrect  
**Solution**: Use exactly `isDarkMode=true` (case-sensitive)

### Issue: Token not recognized
**Cause**: Invalid JWT format  
**Solution**: Verify token structure and expiry

### Issue: URL too long
**Cause**: Long token string  
**Solution**: Use POST request instead or shorten token

### Issue: Color looks wrong
**Cause**: Hex color format incorrect  
**Solution**: Use #RRGGBB format, e.g., #e91e63

## Sample Integration Code

### Node.js/Express
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

app.post('/api/enroll-student', (req, res) => {
  const { studentId, email, brandColor } = req.body;
  
  // Generate token
  const token = jwt.sign({ studentId, email }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
  
  // Build academy URL
  const academyUrl = new URL('https://app.ps-academy.com/');
  academyUrl.searchParams.set('isMobile', 'true');
  academyUrl.searchParams.set('token', token);
  academyUrl.searchParams.set('isDarkMode', 'true');
  academyUrl.searchParams.set('colorCode', brandColor || '#2196f3');
  
  // Send enrollment response
  res.json({
    enrollmentUrl: academyUrl.toString(),
    studentId
  });
});
```

### Python/Flask
```python
from flask import Flask
import jwt
from urllib.parse import urlencode

@app.route('/enroll/<student_id>', methods=['POST'])
def enroll_student(student_id):
    # Generate token
    token = jwt.encode({
        'studentId': student_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'])
    
    # Build URL
    params = {
        'isMobile': 'true',
        'token': token,
        'isDarkMode': 'true',
        'colorCode': '#667eea'
    }
    
    academy_url = f"https://app.ps-academy.com/?{urlencode(params)}"
    return jsonify({'enrollmentUrl': academy_url})
```

### PHP
```php
<?php
function generateEnrollmentUrl($studentId, $email, $brandColor = '#2196f3') {
    // Generate token
    $token = jwt_encode([
        'studentId' => $studentId,
        'email' => $email
    ], getenv('JWT_SECRET'));
    
    // Build URL
    $params = [
        'isMobile' => 'true',
        'token' => $token,
        'isDarkMode' => 'true',
        'colorCode' => $brandColor
    ];
    
    return 'https://app.ps-academy.com/?' . http_build_query($params);
}
?>
```

## Best Practices

1. **Always include `isMobile=true`** for customization
2. **Validate color format** before including in URL
3. **Use secure tokens** with proper expiry
4. **Test URLs before production** deployment
5. **Document your color codes** for consistency
6. **Cache enrollment URLs** when possible
7. **Monitor token expiry** and refresh as needed
8. **Use HTTPS only** for production

## Support & Questions

- For technical details, see `TECHNICAL_IMPLEMENTATION_GUIDE.md`
- For quick reference URLs, see `URL_THEME_COLOR_QUICK_REFERENCE.md`
- For implementation details, see `URL_THEME_COLOR_IMPLEMENTATION.md`

## Summary

The theme and color customization feature enables:
- ✅ White-label style customization
- ✅ Brand consistency across platforms
- ✅ Dark mode support
- ✅ Mobile-optimized experience
- ✅ Seamless external system integration

Start building your customized enrollment flows today!

