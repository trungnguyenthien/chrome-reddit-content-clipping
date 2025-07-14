# Reddit Content Extractor Chrome Extension

A Chrome Extension Manifest V3 that helps extract and export Reddit content in multiple formats - JSON, Markdown, and Copy to Clipboard.

## 🎯 Main Features

### **3 Floating Buttons on Reddit:**
- **📋 Copy Button** (Green) - Copy Markdown to clipboard
- **MD Button** (Blue) - Download Markdown file (.md)  
- **JSON Button** (Orange) - Download JSON file (.json)

### **Extracted Data:**
- ✅ **Title** of Reddit post
- ✅ **Content** main content of the post
- ✅ **Comments** with full hierarchical structure (nested replies)
- ✅ **Author** of each comment and reply
- ✅ **Hierarchical structure** - Preserves original comment tree structure

## 🚀 Extension Installation Guide

### **Step 1: Preparation**
1. Download or clone this project to your computer
2. Ensure you have a folder containing these files:
   ```
   reddit-extension/
   ├── manifest.json
   ├── content.js
   ├── styles.css
   ├── popup.html
   ├── icons/
   └── README.md
   ```

### **Step 2: Open Chrome Extensions**
1. Open **Google Chrome** browser
2. Type `chrome://extensions/` in the address bar
3. Or: **Menu (⋮)** → **Extensions** → **Manage Extensions**

### **Step 3: Enable Developer Mode**
1. Find the **"Developer mode"** toggle in the **top right corner**
2. **Turn ON** Developer mode
3. You'll see 3 new buttons appear: "Load unpacked", "Pack extension", "Update"

### **Step 4: Load Extension** ⚠️ **IMPORTANT**
1. Click the **"Load unpacked"** button
2. **Select the correct root folder** containing the `manifest.json` file
   - ✅ **CORRECT**: Select the `reddit-extension/` folder (contains manifest.json)
   - ❌ **WRONG**: Select parent folder or subfolder
3. Click **"Select Folder"**

### **Step 5: Confirm Installation**
- Extension will appear in the list with name **"Reddit Content Extractor"**
- Extension icon will display on the toolbar
- Status shows **"Enabled"**

## 📖 Usage Guide

### **How to use:**
1. **Visit** https://www.reddit.com/
2. **Open any post** with comments
3. **Find 3 circular buttons** in the bottom right corner of the screen:

### **📋 Copy Button (Green - Top)**
- **Function**: Copy Markdown content to clipboard
- **When to use**: When you want to quickly paste into another document
- **Output**: Markdown text in clipboard
- **Advantages**: 
  - Quick, no file creation
  - Paste directly into Notion, GitHub, Discord...
  - Preserves Markdown formatting

### **MD Button (Blue - Middle)**  
- **Function**: Download Markdown file (.md)
- **When to use**: When you want long-term storage or documentation
- **Output**: .md file named after the post title
- **Advantages**:
  - Permanent storage
  - Readable on any Markdown viewer
  - Beautiful format with hierarchical headers

### **JSON Button (Orange - Bottom)**
- **Function**: Download JSON file (.json) 
- **When to use**: When you need to process data with code
- **Output**: .json file with complete data structure
- **Advantages**:
  - Machine-readable format
  - Preserves 100% of information
  - Easy to parse with programming languages
