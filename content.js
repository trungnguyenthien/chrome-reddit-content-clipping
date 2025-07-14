// Content script cho Reddit Capture Extension
(function() {
  'use strict';

  // Kiểm tra xem button đã được tạo chưa để tránh tạo trùng lặp
  if (document.getElementById('reddit-capture-button')) {
    return;
  }

  // Tạo floating capture button
  function createCaptureButton() {
    const button = document.createElement('button');
    button.id = 'reddit-capture-button';
    button.className = 'capture-button';
    button.title = 'Capture Reddit Content';
    
    // Tạo icon capture
    const icon = document.createElement('div');
    icon.className = 'capture-icon';
    button.appendChild(icon);

    // Thêm event listener cho click
    button.addEventListener('click', handleCaptureClick);

    // Thêm button vào trang
    document.body.appendChild(button);
    
    console.log('Reddit Capture button đã được thêm');
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

  // Xử lý sự kiện click vào button capture
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
      
      // Log để debug
      console.log('🎯 Captured Reddit Content:');
      console.log('Capture Result:', captureResult);
      console.log('Post Title Element:', postTitle);
      console.log('Post Content Element:', postContent);
      console.log('Total Top-level Comments:', captureResult.replies.length);
      
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
        if (!document.getElementById('reddit-capture-button')) {
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
