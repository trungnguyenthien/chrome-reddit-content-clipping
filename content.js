// Content script cho Reddit Capture Extension
(function() {
  'use strict';

  // Kiểm tra xem button đã được tạo chưa để tránh tạo trùng lặp
  if (document.getElementById('reddit-capture-button') || 
      document.getElementById('reddit-md-button') || 
      document.getElementById('reddit-copy-button')) {
    return;
  }

  // Tạo floating JSON download button
  function createCaptureButton() {
    const button = document.createElement('button');
    button.id = 'reddit-capture-button';
    button.className = 'capture-button';
    button.title = 'Download JSON';
    
    // Tạo text JSON
    button.textContent = 'JSON';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';

    // Thêm event listener cho click
    button.addEventListener('click', handleCaptureClick);

    // Thêm button vào trang
    document.body.appendChild(button);
    
    // Tạo button MD
    const mdButton = document.createElement('button');
    mdButton.id = 'reddit-md-button';
    mdButton.className = 'capture-button md-button';
    mdButton.title = 'Download Markdown';
    mdButton.textContent = 'MD';
    mdButton.style.fontSize = '12px';
    mdButton.style.fontWeight = 'bold';
    mdButton.style.bottom = '90px'; // Đặt phía trên button JSON
    
    // Thêm event listener cho MD button
    mdButton.addEventListener('click', handleMDClick);
    
    // Thêm MD button vào trang
    document.body.appendChild(mdButton);
    
    // Tạo button Copy Markdown
    const copyButton = document.createElement('button');
    copyButton.id = 'reddit-copy-button';
    copyButton.className = 'capture-button copy-button';
    copyButton.title = 'Copy Markdown to Clipboard';
    copyButton.innerHTML = '📋'; // Copy icon
    copyButton.style.fontSize = '20px';
    copyButton.style.bottom = '160px'; // Đặt phía trên button MD
    
    // Thêm event listener cho Copy button
    copyButton.addEventListener('click', handleCopyClick);
    
    // Thêm Copy button vào trang
    document.body.appendChild(copyButton);
    
    console.log('Reddit JSON, MD & Copy buttons đã được thêm');
  }

  // Function đệ quy để parse comment và các comment con
  function parseComment(commentElement, depth = 0) {
    try {
      // Lấy commentAuthor là element có class chứa "author-name-meta"
      const authorElement = commentElement.querySelector('[class*="author-name-meta"]');
      const commentAuthor = authorElement ? authorElement.innerText.trim() : 'Unknown Author';
      
      // Lấy commentContent là element div có attribute là [slot="comment"]
      const contentElement = commentElement.querySelector('div[slot="comment"]');
      const commentContent = contentElement ? contentElement.innerText.trim() : '';
      
      // Bỏ qua comment nếu content rỗng
      if (!commentContent || commentContent === '') {
        return null;
      }
      
      // Lấy arrayInsideComments - tất cả element có tag là "shreddit-comment" con trực tiếp
      const insideCommentsElements = commentElement.querySelectorAll(':scope > shreddit-comment');
      const arrayInsideComments = Array.from(insideCommentsElements)
        .map(childComment => parseComment(childComment, depth + 1))
        .filter(comment => comment !== null); // Lọc bỏ các comment null (content rỗng)
      
      return {
        author: commentAuthor,
        content: commentContent,
        depth: depth,
        replies: arrayInsideComments
      };
    } catch (error) {
      console.error('Error parsing comment:', error);
      return null;
    }
  }

  // Function để copy text vào clipboard
  function copyToClipboard(text) {
    try {
      // Sử dụng modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => {
          console.log('✅ Copied to clipboard using Clipboard API');
          return true;
        }).catch(error => {
          console.error('❌ Clipboard API failed:', error);
          return fallbackCopyToClipboard(text);
        });
      } else {
        // Fallback method cho trường hợp không support Clipboard API
        return fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      return Promise.resolve(false);
    }
  }

  // Fallback method để copy vào clipboard
  function fallbackCopyToClipboard(text) {
    try {
      // Tạo textarea tạm thời
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Sử dụng execCommand (deprecated nhưng still work)
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        console.log('✅ Copied to clipboard using fallback method');
        return Promise.resolve(true);
      } else {
        console.error('❌ Fallback copy method failed');
        return Promise.resolve(false);
      }
    } catch (error) {
      console.error('❌ Fallback copy error:', error);
      return Promise.resolve(false);
    }
  }

  // Xử lý sự kiện click vào button Copy Markdown
  function handleCopyClick() {
    try {
      // Lấy element có tag là h1 và có attribute là [slot="title"] lấy innerText
      const postTitle = document.querySelector('h1[slot="title"]');
      
      // Lấy element có tag là div và có attribute là [property="schema:articleBody"] lấy innerText
      const postContent = document.querySelector('div[property="schema:articleBody"]');
      
      // Lấy array chứa tất cả element có tag là "shreddit-comment" trực thuộc element có tag là "shreddit-comment-tree"
      const commentTree = document.querySelector('shreddit-comment-tree');
      const arrayComments = commentTree ? Array.from(commentTree.querySelectorAll(':scope > shreddit-comment')) : [];
      
      // Duyệt arrayComments để lấy nội dung của từng comment
      const commentsContent = arrayComments.map(comment => {
        // Lấy commentAuthor là element có class chứa "author-name-meta"
        const authorElement = comment.querySelector('[class*="author-name-meta"]');
        const commentAuthor = authorElement ? authorElement.innerText.trim() : 'Unknown Author';
        
        // Lấy commentContent là element div có attribute là [slot="comment"]
        const contentElement = comment.querySelector('div[slot="comment"]');
        const commentContent = contentElement ? contentElement.innerText.trim() : '';
        
        // Bỏ qua comment nếu content rỗng
        if (!commentContent || commentContent === '') {
          return null;
        }
        
        // Lấy arrayInsideComments - parse đệ quy các comment con
        const insideCommentsElements = comment.querySelectorAll(':scope > shreddit-comment');
        const arrayInsideComments = Array.from(insideCommentsElements)
          .map(childComment => parseComment(childComment, 1))
          .filter(comment => comment !== null); // Lọc bỏ các comment null (content rỗng)
        
        return {
          author: commentAuthor,
          content: commentContent,
          depth: 0,
          replies: arrayInsideComments
        };
      }).filter(comment => comment !== null); // Lọc bỏ các comment cấp 1 có content rỗng
      
      // Tạo object dữ liệu
      const captureResult = {
        title: postTitle ? postTitle.innerText?.trim() || '' : '',
        content: postContent ? postContent.innerText?.trim() || '' : '',
        replies: commentsContent
      };
      
      // Convert thành Markdown
      const markdownContent = convertToMarkdown(captureResult);
      
      // Copy vào clipboard
      copyToClipboard(markdownContent).then(success => {
        if (success) {
          // Hiển thị thông báo thành công
          alert(`✅ Đã copy Markdown vào clipboard!\n\n📊 Thống kê:\n- Title: ${captureResult.title ? 'Có' : 'Không có'}\n- Content: ${captureResult.content ? 'Có' : 'Không có'}\n- Comments: ${captureResult.replies.length} comment(s)\n- Markdown length: ${markdownContent.length} characters`);
        } else {
          alert('❌ Không thể copy vào clipboard. Vui lòng thử lại!');
        }
      });
      
      // Log để debug
      console.log('🎯 Copied Reddit Content Markdown to Clipboard:');
      console.log('Markdown Content:', markdownContent);
      console.log('Content Length:', markdownContent.length);
      
      return markdownContent;
      
    } catch (error) {
      console.error('❌ Lỗi khi copy Markdown:', error);
      alert('Có lỗi xảy ra khi copy Markdown. Vui lòng thử lại!');
    }
  }

  // Function để convert JSON thành Markdown
  function convertToMarkdown(data) {
    let markdown = '';
    
    // Thêm title
    if (data.title) {
      markdown += `# ${data.title}\n\n`;
    }
    
    // Thêm content
    if (data.content) {
      markdown += `## Post Content\n\n${data.content}\n\n`;
    }
    
    // Thêm comments section
    if (data.replies && data.replies.length > 0) {
      markdown += `## Comments (${data.replies.length})\n\n`;
      
      // Function đệ quy để format comment với markdown
      function formatCommentMarkdown(comment, depth = 0) {
        const indent = '  '.repeat(depth);
        let commentMd = '';
        
        // Header với level tương ứng depth
        const headerLevel = Math.min(depth + 3, 6); // Tối đa h6
        const headerPrefix = '#'.repeat(headerLevel);
        
        commentMd += `${indent}${headerPrefix} @${comment.author}\n\n`;
        commentMd += `${indent}${comment.content}\n\n`;
        
        // Xử lý replies
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            commentMd += formatCommentMarkdown(reply, depth + 1);
          });
        }
        
        return commentMd;
      }
      
      // Format tất cả comments
      data.replies.forEach((comment, index) => {
        markdown += formatCommentMarkdown(comment, 0);
        
        // Thêm separator giữa các comment cấp 1
        if (index < data.replies.length - 1) {
          markdown += '---\n\n';
        }
      });
    }
    
    return markdown;
  }

  // Function để download Markdown file
  function downloadMarkdown(content, filename) {
    try {
      // Tạo blob với content type markdown
      const blob = new Blob([content], { type: 'text/markdown' });
      
      // Tạo URL object
      const url = URL.createObjectURL(blob);
      
      // Tạo link element để download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Thêm link vào DOM, click và remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded Markdown file: ${filename}`);
    } catch (error) {
      console.error('❌ Error downloading Markdown:', error);
      alert('Có lỗi xảy ra khi download file Markdown!');
    }
  }

  // Xử lý sự kiện click vào button MD
  function handleMDClick() {
    try {
      // Lấy element có tag là h1 và có attribute là [slot="title"] lấy innerText
      const postTitle = document.querySelector('h1[slot="title"]');
      
      // Lấy element có tag là div và có attribute là [property="schema:articleBody"] lấy innerText
      const postContent = document.querySelector('div[property="schema:articleBody"]');
      
      // Lấy array chứa tất cả element có tag là "shreddit-comment" trực thuộc element có tag là "shreddit-comment-tree"
      const commentTree = document.querySelector('shreddit-comment-tree');
      const arrayComments = commentTree ? Array.from(commentTree.querySelectorAll(':scope > shreddit-comment')) : [];
      
      // Duyệt arrayComments để lấy nội dung của từng comment
      const commentsContent = arrayComments.map(comment => {
        // Lấy commentAuthor là element có class chứa "author-name-meta"
        const authorElement = comment.querySelector('[class*="author-name-meta"]');
        const commentAuthor = authorElement ? authorElement.innerText.trim() : 'Unknown Author';
        
        // Lấy commentContent là element div có attribute là [slot="comment"]
        const contentElement = comment.querySelector('div[slot="comment"]');
        const commentContent = contentElement ? contentElement.innerText.trim() : '';
        
        // Bỏ qua comment nếu content rỗng
        if (!commentContent || commentContent === '') {
          return null;
        }
        
        // Lấy arrayInsideComments - parse đệ quy các comment con
        const insideCommentsElements = comment.querySelectorAll(':scope > shreddit-comment');
        const arrayInsideComments = Array.from(insideCommentsElements)
          .map(childComment => parseComment(childComment, 1))
          .filter(comment => comment !== null); // Lọc bỏ các comment null (content rỗng)
        
        return {
          author: commentAuthor,
          content: commentContent,
          depth: 0,
          replies: arrayInsideComments
        };
      }).filter(comment => comment !== null); // Lọc bỏ các comment cấp 1 có content rỗng
      
      // Tạo object dữ liệu
      const captureResult = {
        title: postTitle ? postTitle.innerText?.trim() || '' : '',
        content: postContent ? postContent.innerText?.trim() || '' : '',
        replies: commentsContent
      };
      
      // Convert thành Markdown
      const markdownContent = convertToMarkdown(captureResult);
      
      // Tạo filename từ title của trang web
      const pageTitle = captureResult.title || document.title || 'reddit-post';
      // Làm sạch filename (loại bỏ ký tự không hợp lệ)
      const sanitizedTitle = pageTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
      const filename = `${sanitizedTitle}.md`;
      
      // Download file Markdown
      downloadMarkdown(markdownContent, filename);
      
      // Log để debug
      console.log('🎯 Downloaded Reddit Content Markdown:');
      console.log('Markdown Content:', markdownContent);
      console.log('Filename:', filename);
      
      // Hiển thị thông báo thành công
      alert(`✅ Đã download file Markdown: ${filename}\n\n📊 Thống kê:\n- Title: ${captureResult.title ? 'Có' : 'Không có'}\n- Content: ${captureResult.content ? 'Có' : 'Không có'}\n- Comments: ${captureResult.replies.length} comment(s)`);
      
      return markdownContent;
      
    } catch (error) {
      console.error('❌ Lỗi khi tạo Markdown:', error);
      alert('Có lỗi xảy ra khi tạo file Markdown. Vui lòng thử lại!');
    }
  }

  // Function để download JSON file
  function downloadJSON(data, filename) {
    try {
      // Tạo JSON string với format đẹp
      const jsonString = JSON.stringify(data, null, 2);
      
      // Tạo blob với content type JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Tạo URL object
      const url = URL.createObjectURL(blob);
      
      // Tạo link element để download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Thêm link vào DOM, click và remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      URL.revokeObjectURL(url);
      
      console.log(`✅ Downloaded JSON file: ${filename}`);
    } catch (error) {
      console.error('❌ Error downloading JSON:', error);
      alert('Có lỗi xảy ra khi download file JSON!');
    }
  }

  // Xử lý sự kiện click vào button JSON download
  function handleCaptureClick() {
    try {
      // Lấy element có tag là h1 và có attribute là [slot="title"] lấy innerText
      const postTitle = document.querySelector('h1[slot="title"]');
      
      // Lấy element có tag là div và có attribute là [property="schema:articleBody"] lấy innerText
      const postContent = document.querySelector('div[property="schema:articleBody"]');
      
      // Lấy array chứa tất cả element có tag là "shreddit-comment" trực thuộc element có tag là "shreddit-comment-tree"
      const commentTree = document.querySelector('shreddit-comment-tree');
      const arrayComments = commentTree ? Array.from(commentTree.querySelectorAll(':scope > shreddit-comment')) : [];
      
      //TODO: Duyệt arrayComments để lấy nội dung của từng comment
      const commentsContent = arrayComments.map(comment => {
        // Lấy commentAuthor là element có class chứa "author-name-meta"
        const authorElement = comment.querySelector('[class*="author-name-meta"]');
        const commentAuthor = authorElement ? authorElement.innerText.trim() : 'Unknown Author';
        
        // Lấy commentContent là element div có attribute là [slot="comment"]
        const contentElement = comment.querySelector('div[slot="comment"]');
        const commentContent = contentElement ? contentElement.innerText.trim() : '';
        
        // Bỏ qua comment nếu content rỗng
        if (!commentContent || commentContent === '') {
          return null;
        }
        
        // Lấy arrayInsideComments - parse đệ quy các comment con
        const insideCommentsElements = comment.querySelectorAll(':scope > shreddit-comment');
        const arrayInsideComments = Array.from(insideCommentsElements)
          .map(childComment => parseComment(childComment, 1))
          .filter(comment => comment !== null); // Lọc bỏ các comment null (content rỗng)
        
        return {
          author: commentAuthor,
          content: commentContent,
          depth: 0,
          replies: arrayInsideComments
        };
      }).filter(comment => comment !== null); // Lọc bỏ các comment cấp 1 có content rỗng
      
      // Tạo object kết quả chính
      const captureResult = {
        title: postTitle ? postTitle.innerText?.trim() || '' : '',
        content: postContent ? postContent.innerText?.trim() || '' : '',
        replies: commentsContent
      };
      
      // Tạo filename từ title của trang web
      const pageTitle = captureResult.title || document.title || 'reddit-post';
      // Làm sạch filename (loại bỏ ký tự không hợp lệ)
      const sanitizedTitle = pageTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 50);
      const filename = `${sanitizedTitle}.json`;
      
      // Download file JSON
      downloadJSON(captureResult, filename);
      
      // Log để debug
      console.log('🎯 Downloaded Reddit Content JSON:');
      console.log('Capture Result:', captureResult);
      console.log('Filename:', filename);
      console.log('Post Title Element:', postTitle);
      console.log('Post Content Element:', postContent);
      console.log('Total Top-level Comments:', captureResult.replies.length);
      
      // Hiển thị thông báo thành công
      alert(`✅ Đã download file JSON: ${filename}\n\n📊 Thống kê:\n- Title: ${captureResult.title ? 'Có' : 'Không có'}\n- Content: ${captureResult.content ? 'Có' : 'Không có'}\n- Comments: ${captureResult.replies.length} comment(s)`);
      
      // Trả về kết quả (có thể sử dụng cho các mục đích khác)
      return captureResult;
      
    } catch (error) {
      console.error('❌ Lỗi khi capture Reddit content:', error);
      alert('Có lỗi xảy ra khi capture nội dung Reddit. Vui lòng thử lại!');
    }
  }

  // Chờ DOM load xong
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCaptureButton);
  } else {
    createCaptureButton();
  }

  // Xử lý trường hợp trang web sử dụng SPA (Single Page Application)
  // Reddit sử dụng React và có thể thay đổi nội dung mà không reload trang
  let currentUrl = window.location.href;
  
  // Observer để theo dõi thay đổi URL
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      
      // Kiểm tra nếu button bị mất thì tạo lại
      setTimeout(() => {
        if (!document.getElementById('reddit-capture-button') ||
            !document.getElementById('reddit-md-button') ||
            !document.getElementById('reddit-copy-button')) {
          createCaptureButton();
        }
      }, 1000);
    }
  });

  // Bắt đầu observer
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
