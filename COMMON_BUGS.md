# Common Build Issues & Solutions for Jewelry ERP

This document outlines common build failures and their solutions to prevent deployment issues on Vercel and other platforms.

## 🚨 **Critical Build Failures (Must Fix)**

### **1. Unescaped Characters in JSX**
**Error Message:**
```
`'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

**Cause:** Direct apostrophes, quotes, or special characters in JSX text content

**❌ Wrong:**
```jsx
<p>The order you're looking for doesn't exist.</p>
<h1>Welcome to "Jewelry ERP"</h1>
<span>Price: > $100</span>
```

**✅ Correct:**
```jsx
<p>The order you&apos;re looking for doesn&apos;t exist.</p>
<p>{"The order you're looking for doesn't exist."}</p>
<h1>Welcome to &quot;Jewelry ERP&quot;</h1>
<span>Price: &gt; $100</span>
```

**Quick Fix:**
- Replace `'` with `&apos;`
- Replace `"` with `&quot;`
- Replace `>` with `&gt;`
- Replace `<` with `&lt;`
- Or wrap in curly braces: `{"text with 'quotes'"}`

---

### **2. React Hooks Exhaustive Dependencies**
**Warning Message:**
```
React Hook useEffect has a missing dependency: 'functionName'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
```

**Cause:** Functions used inside useEffect are not included in dependency array

**❌ Wrong:**
```jsx
const fetchData = async () => {
  // fetch logic
};

useEffect(() => {
  fetchData(); // fetchData not in dependencies
}, [someVar]);
```

**✅ Correct Option 1 - useCallback:**
```jsx
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependencies]);

useEffect(() => {
  fetchData();
}, [someVar, fetchData]);
```

**✅ Correct Option 2 - Inline function:**
```jsx
useEffect(() => {
  const fetchData = async () => {
    // fetch logic
  };
  fetchData();
}, [someVar]);
```

---

### **3. Next.js Image Optimization**
**Warning Message:**
```
Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image`  @next/next/no-img-element
```

**Cause:** Using HTML `<img>` instead of Next.js optimized `<Image />` component

**❌ Wrong:**
```jsx
<img src={url} alt="description" className="w-full h-full object-cover" />
```

**✅ Correct:**
```jsx
import Image from 'next/image';

// For fixed dimensions
<Image 
  src={url} 
  alt="description" 
  width={200} 
  height={200}
  className="object-cover"
/>

// For fill container
<div className="relative w-full h-full">
  <Image 
    src={url} 
    alt="description" 
    fill
    className="object-cover"
  />
</div>
```

---

## ⚠️ **Common Warnings (Should Fix)**

### **4. Missing Keys in Lists**
```jsx
// ❌ Wrong
{items.map(item => <div>{item.name}</div>)}

// ✅ Correct
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### **5. Unused Variables**
```jsx
// ❌ Wrong
const [data, setData] = useState(null); // setData never used

// ✅ Correct
const [data] = useState(null); // Remove unused setter
```

### **6. Console Statements in Production**
```jsx
// ❌ Wrong
console.log('Debug info');

// ✅ Correct
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

---

## 🛠 **Pre-Push Checklist**

### **Before Every Commit:**
- [ ] Run `npm run lint` locally
- [ ] Fix ALL ESLint errors (red text)
- [ ] Address ESLint warnings (yellow text) when possible
- [ ] Test build locally: `npm run build`
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Verify responsive design on mobile

### **Quick Commands:**
```bash
# Auto-fix many ESLint issues
npm run lint -- --fix

# Check specific rules
npm run lint -- --rule 'react-hooks/exhaustive-deps: error'

# Build and check for errors
npm run build

# Type checking
npx tsc --noEmit
```

---

## 🔧 **ESLint Configuration Tips**

### **Common Rules to Watch:**
- `react/no-unescaped-entities` - Fix apostrophes and quotes
- `react-hooks/exhaustive-deps` - Complete useEffect dependencies
- `@next/next/no-img-element` - Use Next.js Image component
- `react-hooks/rules-of-hooks` - Hooks usage rules
- `@typescript-eslint/no-unused-vars` - Remove unused variables

### **Disable Rules (Use Sparingly):**
```jsx
// Disable for single line
// eslint-disable-next-line react/no-unescaped-entities
<p>Don't disable unless absolutely necessary</p>

// Disable for file (top of file)
/* eslint-disable react/no-unescaped-entities */
```

---

## 🚨 **Emergency Fixes for Build Failures**

### **If Build Fails on Vercel:**

1. **Check the exact error line number in build log**
2. **Fix unescaped characters first (most common)**
3. **Add missing useEffect dependencies**
4. **Replace img with Image component**
5. **Test locally before pushing**

### **Quick Text Fixes:**
```javascript
// Quick replace function for common characters
const fixText = (text) => {
  return text
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;');
};
```

---

## 📋 **Jewelry ERP Specific Issues**

### **Date Formatting:**
```jsx
// ❌ Wrong - Can cause hydration errors
<span>{new Date().toString()}</span>

// ✅ Correct - Consistent formatting
import { format } from 'date-fns';
<span>{format(new Date(), 'MMM dd, yyyy')}</span>
```

### **Weight/Number Formatting:**
```jsx
// ❌ Wrong - Potential precision issues
<span>{weight}</span>

// ✅ Correct - Consistent decimal places
<span>{weight.toFixed(3)} grams</span>
```

### **API Error Handling:**
```jsx
// ❌ Wrong - Unhandled errors crash build
const data = await api.getOrders();

// ✅ Correct - Proper error handling
try {
  const data = await api.getOrders();
} catch (error) {
  console.error('Failed to fetch orders:', error);
  toast.error('Failed to load orders');
}
```

---

## 🎯 **Success Metrics**

### **Goal: Zero Build Errors**
- ✅ All ESLint errors fixed
- ✅ All TypeScript errors resolved
- ✅ Build completes successfully
- ✅ No console errors in browser
- ✅ Responsive design works on mobile

### **Monitoring:**
- Check Vercel build logs for each deployment
- Monitor browser console for runtime errors
- Test key user flows after deployment
- Verify API connectivity in production

---

## 🔄 **Continuous Improvement**

### **Add to VS Code Settings:**
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

### **Git Pre-commit Hook:**
```bash
# Add to .husky/pre-commit
npm run lint
npm run type-check
```

---

This document should be updated whenever new common issues are discovered. Always test fixes locally before pushing to prevent build failures in production.

**Last Updated:** December 2024  
**Next Review:** After major dependency updates