# Reddit Capture Chrome Extension

Một Chrome Extension V3 để capture nội dung trên Reddit với button floating tiện lợi.

## ✨ Tính năng

- 🎯 Chỉ hoạt động trên trang web Reddit (https://www.reddit.com/)
- 📷 Button tròn floating ở góc phải dưới màn hình
- 🔍 Click để hiển thị title của trang web hiện tại
- 🎨 Giao diện đẹp mắt với hiệu ứng hover

## 🚀 Cách cài đặt

1. **Mở Chrome và truy cập Extensions**
   - Mở Chrome
   - Gõ `chrome://extensions/` trên thanh địa chỉ
   - Hoặc Menu → More Tools → Extensions

2. **Bật Developer Mode**
   - Bật switch "Developer mode" ở góc phải trên

3. **Load Extension**
   - Click "Load unpacked"
   - Chọn thư mục chứa project này
   - Extension sẽ được cài đặt và xuất hiện trong danh sách

## 📖 Cách sử dụng

1. Truy cập https://www.reddit.com/
2. Bạn sẽ thấy một button tròn màu cam với icon camera ở góc phải dưới màn hình
3. Click vào button để hiển thị alert chứa title của trang web

## 📁 Cấu trúc project

```
reddit-capture-extension/
├── manifest.json          # Cấu hình chính của extension
├── content.js             # Script chạy trên Reddit
├── styles.css             # CSS cho button floating
├── popup.html             # Popup của extension
├── icons/                 # Thư mục chứa icons
└── README.md             # File hướng dẫn này
```

## 🔧 Tùy chỉnh

### Thay đổi vị trí button
Trong file `styles.css`, sửa properties:
```css
.capture-button {
  bottom: 20px;  /* Khoảng cách từ đáy */
  right: 20px;   /* Khoảng cách từ phải */
}
```

### Thay đổi màu sắc
```css
.capture-button {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}
```

### Thêm trang web khác
Trong `manifest.json`, thêm URL vào `matches`:
```json
"matches": [
  "https://www.reddit.com/*",
  "https://your-website.com/*"
]
```

## 🐛 Troubleshooting

**Button không xuất hiện:**
- Kiểm tra bạn đang ở đúng trang Reddit
- Refresh trang web
- Kiểm tra Console (F12) xem có lỗi không

**Extension không hoạt động:**
- Kiểm tra extension đã được enable
- Refresh trang và thử lại
- Kiểm tra permissions trong Chrome

## 📝 Phát triển thêm

Để mở rộng tính năng:

1. **Capture screenshot:** Sử dụng `chrome.tabs.captureVisibleTab()`
2. **Lưu nội dung:** Thêm `storage` permission
3. **Upload cloud:** Tích hợp API upload
4. **Capture specific elements:** Sử dụng DOM selection

## 🔒 Permissions

Extension chỉ yêu cầu permission tối thiểu:
- `activeTab`: Để đọc title của tab hiện tại

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa.
