// ================================================================
// GlowNature Blog Platform — IndexedDB + Full CRUD
// ================================================================

var blogDB = null;
var DB_NAME = 'GlowNatureBlogDB';
var DB_VERSION = 1;
var currentViewPostId = null;
var deleteTargetId = null;
var activeCategory = 'all';

// ===== IndexedDB Setup =====
function openBlogDB(callback) {
  var request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = function (e) {
    var db = e.target.result;

    // Posts store
    if (!db.objectStoreNames.contains('posts')) {
      var postStore = db.createObjectStore('posts', { keyPath: 'id' });
      postStore.createIndex('status', 'status', { unique: false });
      postStore.createIndex('category', 'category', { unique: false });
      postStore.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // Comments store
    if (!db.objectStoreNames.contains('comments')) {
      var commentStore = db.createObjectStore('comments', { keyPath: 'id' });
      commentStore.createIndex('postId', 'postId', { unique: false });
    }
  };

  request.onsuccess = function (e) {
    blogDB = e.target.result;
    if (callback) callback();
  };

  request.onerror = function () {
    console.error('Failed to open blog database');
  };
}

// ===== Generic DB Helpers =====
function dbTransaction(storeName, mode) {
  return blogDB.transaction(storeName, mode).objectStore(storeName);
}

function dbGetAll(storeName, callback) {
  var store = dbTransaction(storeName, 'readonly');
  var request = store.getAll();
  request.onsuccess = function () { callback(request.result || []); };
  request.onerror = function () { callback([]); };
}

function dbGet(storeName, id, callback) {
  var store = dbTransaction(storeName, 'readonly');
  var request = store.get(id);
  request.onsuccess = function () { callback(request.result); };
  request.onerror = function () { callback(null); };
}

function dbPut(storeName, item, callback) {
  var store = dbTransaction(storeName, 'readwrite');
  var request = store.put(item);
  request.onsuccess = function () { if (callback) callback(true); };
  request.onerror = function () { if (callback) callback(false); };
}

function dbDelete(storeName, id, callback) {
  var store = dbTransaction(storeName, 'readwrite');
  var request = store.delete(id);
  request.onsuccess = function () { if (callback) callback(true); };
  request.onerror = function () { if (callback) callback(false); };
}

// ===== Generate Unique ID =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

// ===== Seed Default Posts =====
function seedDefaultPosts(callback) {
  dbGetAll('posts', function (posts) {
    if (posts.length > 0) { callback(); return; }

    var defaults = [
      {
        id: generateId(),
        title: 'Aloe Vera: Nature\'s Moisturizer',
        excerpt: 'Hydrates, soothes sunburns, fights acne & fades dark spots. Use daily on clean skin for best results.',
        content: '<h2>Why Aloe Vera is a Skincare Superstar</h2><p>Aloe vera has been used for centuries as a natural remedy for skin issues. Its gel-like substance is packed with vitamins, minerals, and antioxidants that work wonders for your skin.</p><h3>Key Benefits</h3><ul><li><strong>Deep Hydration</strong> — Aloe vera penetrates skin layers to deliver intense moisture without clogging pores.</li><li><strong>Sunburn Relief</strong> — The cooling properties soothe sun-damaged skin and accelerate healing.</li><li><strong>Acne Fighter</strong> — Antibacterial compounds help reduce acne-causing bacteria.</li><li><strong>Dark Spot Fading</strong> — Regular use helps lighten hyperpigmentation and even out skin tone.</li></ul><h3>How to Use</h3><p>Apply fresh aloe vera gel directly to clean skin every morning and night. For best results, leave it on for 15-20 minutes before applying your moisturizer.</p><blockquote>Pro tip: Keep your aloe vera gel in the fridge for an extra cooling and refreshing experience!</blockquote><p>Whether you grow your own aloe plant or buy pure gel, this ingredient deserves a permanent spot in your skincare routine.</p>',
        coverImage: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=400&fit=crop&q=80',
        category: 'Ingredients',
        author: 'GlowNature Team',
        tags: ['aloe vera', 'moisturizer', 'natural', 'hydration'],
        status: 'published',
        likes: 24,
        createdAt: new Date('2026-03-05').getTime(),
        updatedAt: new Date('2026-03-05').getTime()
      },
      {
        id: generateId(),
        title: 'Turmeric: The Golden Secret to Beautiful Skin',
        excerpt: 'Curcumin brightens skin, heals scars & controls oil. Mix with honey for an instant glow mask.',
        content: '<h2>Unlock the Power of Turmeric</h2><p>Turmeric, the golden spice of India, isn\'t just for cooking. Its active compound, curcumin, offers remarkable benefits for skin health.</p><h3>DIY Turmeric Face Mask</h3><p>Here\'s a simple recipe you can try at home:</p><ol><li>Mix 1 teaspoon turmeric powder with 2 tablespoons raw honey</li><li>Add 1 tablespoon yogurt for extra moisture</li><li>Apply evenly on face, avoiding the eye area</li><li>Leave for 15 minutes, then rinse with lukewarm water</li></ol><h3>Why It Works</h3><p>Curcumin is a powerful anti-inflammatory and antioxidant. It helps:</p><ul><li>Brighten dull complexions</li><li>Fade acne scars and dark spots</li><li>Control excess oil production</li><li>Fight signs of aging</li></ul><blockquote>Warning: Turmeric can temporarily stain skin yellow. Use at night and follow with your regular cleanser.</blockquote>',
        coverImage: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=400&fit=crop&q=80',
        category: 'DIY',
        author: 'GlowNature Team',
        tags: ['turmeric', 'DIY', 'face mask', 'brightening'],
        status: 'published',
        likes: 31,
        createdAt: new Date('2026-02-20').getTime(),
        updatedAt: new Date('2026-02-20').getTime()
      },
      {
        id: generateId(),
        title: 'Rose Water: Beauty in a Bottle',
        excerpt: 'Balances pH, minimizes pores & calms redness. Use as toner, mist, or mask base — works for all skin types.',
        content: '<h2>The Timeless Beauty of Rose Water</h2><p>Rose water has been a beauty staple since ancient Egyptian times. Cleopatra herself was known to use rose-infused products in her skincare routine.</p><h3>5 Ways to Use Rose Water</h3><ol><li><strong>As a toner</strong> — Apply with a cotton pad after cleansing</li><li><strong>As a face mist</strong> — Spritz throughout the day for a refreshing boost</li><li><strong>As a mask base</strong> — Mix with clay or other ingredients</li><li><strong>As a makeup setting spray</strong> — Light mist over finished makeup</li><li><strong>As an eye compress</strong> — Soak cotton pads for tired eyes</li></ol><p>Rose water is gentle enough for all skin types, including sensitive skin. Its anti-inflammatory properties make it perfect for calming redness and irritation.</p>',
        coverImage: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=400&fit=crop&q=80',
        category: 'Skincare',
        author: 'GlowNature Team',
        tags: ['rose water', 'toner', 'natural', 'all skin types'],
        status: 'published',
        likes: 18,
        createdAt: new Date('2026-01-28').getTime(),
        updatedAt: new Date('2026-01-28').getTime()
      },
      {
        id: generateId(),
        title: 'Vitamin C: Your Ultimate Glow Booster',
        excerpt: '15% L-Ascorbic Acid brightens, fades dark spots & boosts collagen. Apply mornings before sunscreen.',
        content: '<h2>Why Every Skin Needs Vitamin C</h2><p>Vitamin C (L-Ascorbic Acid) is one of the most researched and proven skincare ingredients. Here\'s why dermatologists recommend it.</p><h3>Benefits</h3><ul><li><strong>Brightening</strong> — Inhibits melanin production for a more radiant complexion</li><li><strong>Collagen Boost</strong> — Stimulates collagen synthesis for firmer skin</li><li><strong>UV Protection</strong> — Works alongside sunscreen to fight free radical damage</li><li><strong>Dark Spot Correction</strong> — Gradually fades post-inflammatory hyperpigmentation</li></ul><h3>How to Incorporate It</h3><p>Apply 3-4 drops of Vitamin C serum every morning on clean, dry skin. Wait 1-2 minutes, then follow with moisturizer and sunscreen (SPF 50).</p><blockquote>Always store Vitamin C serum in a cool, dark place. If it turns brown or orange, it has oxidized and should be replaced.</blockquote>',
        coverImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=400&fit=crop&q=80',
        category: 'Skincare',
        author: 'GlowNature Team',
        tags: ['vitamin C', 'serum', 'brightening', 'anti-aging'],
        status: 'published',
        likes: 42,
        createdAt: new Date('2026-01-15').getTime(),
        updatedAt: new Date('2026-01-15').getTime()
      },
      {
        id: generateId(),
        title: 'Coconut Oil: The Ultimate Hair & Skin Hero',
        excerpt: 'Rich in lauric acid & Vitamin E. Conditions hair, prevents dandruff & doubles as a body moisturizer.',
        content: '<h2>Coconut Oil: Nature\'s Multi-Tasker</h2><p>Cold-pressed virgin coconut oil is one of the most versatile natural beauty products you can own. Its unique combination of fatty acids makes it beneficial for both hair and skin.</p><h3>For Hair</h3><ul><li>Deep conditions dry, damaged hair</li><li>Prevents protein loss from washing</li><li>Fights dandruff with antimicrobial properties</li><li>Adds shine and reduces frizz</li></ul><h3>For Skin</h3><ul><li>Intensely moisturizes dry areas</li><li>Works as a gentle makeup remover</li><li>Soothes minor skin irritations</li><li>Can be used as a body massage oil</li></ul><p>Use it as an overnight hair mask once a week, or apply a thin layer to damp skin after showering.</p>',
        coverImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=400&fit=crop&q=80',
        category: 'Hair Care',
        author: 'GlowNature Team',
        tags: ['coconut oil', 'hair care', 'moisturizer', 'multi-purpose'],
        status: 'published',
        likes: 15,
        createdAt: new Date('2026-01-05').getTime(),
        updatedAt: new Date('2026-01-05').getTime()
      },
      {
        id: generateId(),
        title: 'Niacinamide: The Pore Minimizer',
        excerpt: 'Vitamin B3 shrinks pores, evens skin tone & strengthens the skin barrier. Best used in your night routine.',
        content: '<h2>Niacinamide: The Ingredient Everyone Needs</h2><p>Niacinamide (Vitamin B3) has become one of the trendiest ingredients in skincare — and for good reason. It works for virtually every skin type and concern.</p><h3>What It Does</h3><ul><li><strong>Minimizes pores</strong> — Regulates sebum production so pores appear smaller</li><li><strong>Evens skin tone</strong> — Reduces redness and blotchiness</li><li><strong>Strengthens barrier</strong> — Boosts ceramide production for healthier skin</li><li><strong>Smooths texture</strong> — Refines rough, uneven skin surface</li></ul><h3>How to Use</h3><p>Apply a 10% niacinamide serum after cleansing and toning, preferably in your evening routine. It pairs well with hyaluronic acid and retinol but should not be used simultaneously with Vitamin C at high concentrations.</p>',
        coverImage: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=400&fit=crop&q=80',
        category: 'Trending',
        author: 'GlowNature Team',
        tags: ['niacinamide', 'pore minimizer', 'trending', 'night routine'],
        status: 'published',
        likes: 37,
        createdAt: new Date('2025-12-22').getTime(),
        updatedAt: new Date('2025-12-22').getTime()
      }
    ];

    var remaining = defaults.length;
    defaults.forEach(function (post) {
      dbPut('posts', post, function () {
        remaining--;
        if (remaining === 0) callback();
      });
    });
  });
}

// ===== Render Posts =====
function renderBlogPosts() {
  dbGetAll('posts', function (posts) {
    var searchTerm = (document.getElementById('blogSearch').value || '').toLowerCase().trim();
    var sortBy = document.getElementById('blogSort').value;
    var statusFilter = document.getElementById('statusFilter').value;

    // Filter by status
    if (statusFilter === 'published') {
      posts = posts.filter(function (p) { return p.status === 'published'; });
    } else if (statusFilter === 'draft') {
      posts = posts.filter(function (p) { return p.status === 'draft'; });
    }

    // Filter by category
    if (activeCategory !== 'all') {
      posts = posts.filter(function (p) { return p.category === activeCategory; });
    }

    // Filter by search
    if (searchTerm) {
      posts = posts.filter(function (p) {
        return p.title.toLowerCase().indexOf(searchTerm) !== -1 ||
          p.excerpt.toLowerCase().indexOf(searchTerm) !== -1 ||
          (p.content || '').toLowerCase().indexOf(searchTerm) !== -1 ||
          p.tags.join(' ').toLowerCase().indexOf(searchTerm) !== -1 ||
          p.author.toLowerCase().indexOf(searchTerm) !== -1;
      });
    }

    // Sort
    if (sortBy === 'newest') {
      posts.sort(function (a, b) { return b.createdAt - a.createdAt; });
    } else if (sortBy === 'oldest') {
      posts.sort(function (a, b) { return a.createdAt - b.createdAt; });
    } else if (sortBy === 'title') {
      posts.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (sortBy === 'popular') {
      posts.sort(function (a, b) { return (b.likes || 0) - (a.likes || 0); });
    }

    var grid = document.getElementById('blogPostsGrid');
    var empty = document.getElementById('blogEmpty');
    var countEl = document.getElementById('postCount');

    countEl.textContent = posts.length + ' post' + (posts.length !== 1 ? 's' : '');

    if (posts.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = '';

    posts.forEach(function (post) {
      var card = document.createElement('article');
      card.className = 'blog-post-card';
      card.setAttribute('data-id', post.id);

      // Cover
      var coverHtml = '';
      if (post.coverImage) {
        coverHtml = '<div class="post-cover">' +
          '<img src="' + escapeHtml(post.coverImage) + '" alt="' + escapeHtml(post.title) + '" onerror="this.parentElement.innerHTML=\'<div class=post-cover-placeholder>📝</div>\'">' +
          '<span class="post-category-badge">' + escapeHtml(post.category) + '</span>' +
          '<span class="post-status-badge ' + post.status + '">' + post.status + '</span>' +
          '</div>';
      } else {
        coverHtml = '<div class="post-cover-placeholder">' +
          '<span class="post-category-badge">' + escapeHtml(post.category) + '</span>' +
          '<span class="post-status-badge ' + post.status + '">' + post.status + '</span>' +
          '📝</div>';
      }

      // Tags
      var tagsHtml = '<div class="post-tags">';
      (post.tags || []).slice(0, 3).forEach(function (tag) {
        tagsHtml += '<span>' + escapeHtml(tag) + '</span>';
      });
      tagsHtml += '</div>';

      // Read time
      var wordCount = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
      var readTime = Math.max(1, Math.round(wordCount / 200));

      // Date
      var dateStr = formatDate(post.createdAt);

      // Comment count
      getCommentCount(post.id, function (commentCountVal) {
        var existingFooter = card.querySelector('.post-stats');
        if (existingFooter) {
          var commentSpan = existingFooter.querySelector('.comment-stat');
          if (commentSpan) commentSpan.textContent = '💬 ' + commentCountVal;
        }
      });

      card.innerHTML = coverHtml +
        '<div class="post-body">' +
        '<div class="post-date-author"><span>📅 ' + dateStr + '</span><span>✍ ' + escapeHtml(post.author) + '</span></div>' +
        '<h3>' + escapeHtml(post.title) + '</h3>' +
        '<p class="post-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        tagsHtml +
        '<div class="post-footer">' +
        '<div class="post-stats">' +
        '<span>♡ ' + (post.likes || 0) + '</span>' +
        '<span class="comment-stat">💬 0</span>' +
        '<span>⏱ ' + readTime + ' min</span>' +
        '</div>' +
        '<button class="post-read-btn" onclick="event.stopPropagation(); openViewer(\'' + post.id + '\')">Read More</button>' +
        '</div>' +
        '</div>';

      card.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') return;
        openViewer(post.id);
      });

      grid.appendChild(card);
    });
  });
}

function getCommentCount(postId, callback) {
  var store = dbTransaction('comments', 'readonly');
  var index = store.index('postId');
  var request = index.getAll(postId);
  request.onsuccess = function () {
    callback((request.result || []).length);
  };
  request.onerror = function () { callback(0); };
}

// ===== Filter Functions =====
function filterBlogPosts() {
  renderBlogPosts();
}

function filterByCategory(category) {
  activeCategory = category;
  var buttons = document.querySelectorAll('.blog-filter-btn');
  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.textContent.trim() === category || (category === 'all' && btn.textContent.trim() === 'All'));
  });
  renderBlogPosts();
}

// ===== Rich Text Editor Commands =====
function execCmd(command, value) {
  document.execCommand(command, false, value || null);
  document.getElementById('postContent').focus();
}

function insertLink() {
  var url = prompt('Enter the URL:');
  if (url) {
    // Basic URL validation
    if (url.indexOf('http') !== 0) url = 'https://' + url;
    document.execCommand('createLink', false, url);
  }
  document.getElementById('postContent').focus();
}

function insertImage() {
  var url = prompt('Enter the image URL:');
  if (url) {
    document.execCommand('insertImage', false, url);
  }
  document.getElementById('postContent').focus();
}

// ===== Editor Open/Close =====
function openEditor(postId) {
  document.getElementById('editPostId').value = postId || '';
  document.getElementById('editorTitle').textContent = postId ? 'Edit Post' : 'Create New Post';

  // Reset form
  document.getElementById('postTitle').value = '';
  document.getElementById('postCoverImage').value = '';
  document.getElementById('postCategory').value = '';
  document.getElementById('postAuthor').value = '';
  document.getElementById('postTags').value = '';
  document.getElementById('postExcerpt').value = '';
  document.getElementById('postContent').innerHTML = '';
  document.getElementById('coverPreview').innerHTML = '';
  document.getElementById('coverPreview').classList.remove('has-image');
  document.getElementById('tagsPreview').innerHTML = '';
  updateCharCounts();

  if (postId) {
    dbGet('posts', postId, function (post) {
      if (!post) return;
      document.getElementById('postTitle').value = post.title;
      document.getElementById('postCoverImage').value = post.coverImage || '';
      document.getElementById('postCategory').value = post.category;
      document.getElementById('postAuthor').value = post.author;
      document.getElementById('postTags').value = (post.tags || []).join(', ');
      document.getElementById('postExcerpt').value = post.excerpt;
      document.getElementById('postContent').innerHTML = post.content || '';
      updateCharCounts();
      previewCoverImage();
      previewTags();
    });
  }

  document.getElementById('editorModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeEditor() {
  document.getElementById('editorModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ===== Save Blog Post =====
function saveBlogPost(status) {
  var title = document.getElementById('postTitle').value.trim();
  var coverImage = document.getElementById('postCoverImage').value.trim();
  var category = document.getElementById('postCategory').value;
  var author = document.getElementById('postAuthor').value.trim();
  var tagsRaw = document.getElementById('postTags').value.trim();
  var excerpt = document.getElementById('postExcerpt').value.trim();
  var content = document.getElementById('postContent').innerHTML.trim();

  // Validation
  if (!title) { blogToast('Please enter a post title'); return; }
  if (!category) { blogToast('Please select a category'); return; }
  if (!author) { blogToast('Please enter the author name'); return; }
  if (!excerpt) { blogToast('Please write an excerpt'); return; }
  if (!content || content === '<br>') { blogToast('Please write some content'); return; }

  var tags = tagsRaw ? tagsRaw.split(',').map(function (t) { return t.trim(); }).filter(Boolean) : [];

  var postId = document.getElementById('editPostId').value;
  var now = Date.now();

  if (postId) {
    // Update existing
    dbGet('posts', postId, function (existing) {
      if (!existing) { blogToast('Post not found'); return; }
      existing.title = title;
      existing.coverImage = coverImage;
      existing.category = category;
      existing.author = author;
      existing.tags = tags;
      existing.excerpt = excerpt;
      existing.content = content;
      existing.status = status;
      existing.updatedAt = now;

      dbPut('posts', existing, function () {
        closeEditor();
        renderBlogPosts();
        blogToast(status === 'published' ? 'Post updated & published!' : 'Draft saved!');
      });
    });
  } else {
    // Create new
    var post = {
      id: generateId(),
      title: title,
      coverImage: coverImage,
      category: category,
      author: author,
      tags: tags,
      excerpt: excerpt,
      content: content,
      status: status,
      likes: 0,
      createdAt: now,
      updatedAt: now
    };
    dbPut('posts', post, function () {
      closeEditor();
      renderBlogPosts();
      blogToast(status === 'published' ? 'Post published successfully!' : 'Draft saved!');
    });
  }
}

// ===== Viewer =====
function openViewer(postId) {
  currentViewPostId = postId;
  dbGet('posts', postId, function (post) {
    if (!post) return;

    // Cover
    var coverEl = document.getElementById('viewerCover');
    if (post.coverImage) {
      coverEl.innerHTML = '<img src="' + escapeHtml(post.coverImage) + '" alt="' + escapeHtml(post.title) + '" onerror="this.parentElement.innerHTML=\'<div class=cover-placeholder>📝</div>\'">';
    } else {
      coverEl.innerHTML = '<div class="cover-placeholder">📝</div>';
    }

    // Meta
    document.getElementById('viewerCategory').textContent = post.category;
    var statusEl = document.getElementById('viewerStatus');
    statusEl.textContent = post.status;
    statusEl.className = 'viewer-status ' + post.status;

    // Title & Info
    document.getElementById('viewerTitle').textContent = post.title;
    document.getElementById('viewerAuthor').textContent = '✍ ' + post.author;
    document.getElementById('viewerDate').textContent = '📅 ' + formatDate(post.createdAt);

    var wordCount = (post.content || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
    var readTime = Math.max(1, Math.round(wordCount / 200));
    document.getElementById('viewerReadTime').textContent = '⏱ ' + readTime + ' min read';

    // Tags
    var tagsEl = document.getElementById('viewerTags');
    tagsEl.innerHTML = '';
    (post.tags || []).forEach(function (tag) {
      var span = document.createElement('span');
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    // Body
    document.getElementById('viewerBody').innerHTML = post.content || '';

    // Likes
    var likedPosts = JSON.parse(localStorage.getItem('blog_liked') || '[]');
    var isLiked = likedPosts.indexOf(post.id) !== -1;
    var likeBtn = document.getElementById('viewerLikeBtn');
    likeBtn.classList.toggle('liked', isLiked);
    document.getElementById('likeIcon').textContent = isLiked ? '♥' : '♡';
    document.getElementById('likeCount').textContent = post.likes || 0;

    // Load comments
    loadComments(postId);

    document.getElementById('viewerModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

function closeViewer() {
  document.getElementById('viewerModal').classList.remove('active');
  document.body.style.overflow = '';
  currentViewPostId = null;
  renderBlogPosts(); // Refresh to update like counts
}

// ===== Like Toggle =====
function toggleLike() {
  if (!currentViewPostId) return;
  var likedPosts = JSON.parse(localStorage.getItem('blog_liked') || '[]');
  var idx = likedPosts.indexOf(currentViewPostId);

  dbGet('posts', currentViewPostId, function (post) {
    if (!post) return;

    if (idx !== -1) {
      likedPosts.splice(idx, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    } else {
      likedPosts.push(currentViewPostId);
      post.likes = (post.likes || 0) + 1;
    }

    localStorage.setItem('blog_liked', JSON.stringify(likedPosts));
    dbPut('posts', post, function () {
      var isLiked = likedPosts.indexOf(post.id) !== -1;
      document.getElementById('viewerLikeBtn').classList.toggle('liked', isLiked);
      document.getElementById('likeIcon').textContent = isLiked ? '♥' : '♡';
      document.getElementById('likeCount').textContent = post.likes;
    });
  });
}

// ===== Edit / Delete from Viewer =====
function editFromViewer() {
  if (!currentViewPostId) return;
  closeViewer();
  setTimeout(function () { openEditor(currentViewPostId); }, 300);
}

function deleteFromViewer() {
  if (!currentViewPostId) return;
  deleteTargetId = currentViewPostId;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  deleteTargetId = null;
}

function confirmDeletePost() {
  if (!deleteTargetId) return;

  // Delete comments for this post
  var store = dbTransaction('comments', 'readonly');
  var index = store.index('postId');
  var request = index.getAll(deleteTargetId);
  request.onsuccess = function () {
    var comments = request.result || [];
    var remaining = comments.length;
    if (remaining === 0) {
      deletePostRecord();
    } else {
      comments.forEach(function (c) {
        dbDelete('comments', c.id, function () {
          remaining--;
          if (remaining === 0) deletePostRecord();
        });
      });
    }
  };

  function deletePostRecord() {
    dbDelete('posts', deleteTargetId, function () {
      closeDeleteModal();
      closeViewer();
      renderBlogPosts();
      blogToast('Post deleted successfully');
      deleteTargetId = null;
    });
  }
}

// ===== Share =====
function sharePost() {
  if (!currentViewPostId) return;
  dbGet('posts', currentViewPostId, function (post) {
    if (!post) return;
    var text = post.title + ' — Read this article on GlowNature Blog!';
    if (navigator.share) {
      navigator.share({ title: post.title, text: text, url: window.location.href });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text + ' ' + window.location.href).then(function () {
        blogToast('Link copied to clipboard!');
      });
    } else {
      blogToast('Share not supported on this browser');
    }
  });
}

// ===== Comments =====
function loadComments(postId) {
  var store = dbTransaction('comments', 'readonly');
  var index = store.index('postId');
  var request = index.getAll(postId);
  request.onsuccess = function () {
    var comments = (request.result || []).sort(function (a, b) { return b.createdAt - a.createdAt; });
    var listEl = document.getElementById('commentsList');
    document.getElementById('commentCount').textContent = comments.length;
    listEl.innerHTML = '';

    comments.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = '<div class="comment-header">' +
        '<span class="comment-author">' + escapeHtml(c.author) + '</span>' +
        '<span><span class="comment-date">' + formatDate(c.createdAt) + '</span>' +
        '<button class="comment-delete-btn" onclick="deleteComment(\'' + c.id + '\')" title="Delete">✕</button></span>' +
        '</div>' +
        '<div class="comment-text">' + escapeHtml(c.text) + '</div>';
      listEl.appendChild(div);
    });
  };
}

function addComment() {
  if (!currentViewPostId) return;
  var author = document.getElementById('commentAuthor').value.trim();
  var text = document.getElementById('commentText').value.trim();

  if (!author) { blogToast('Please enter your name'); return; }
  if (!text) { blogToast('Please write a comment'); return; }

  var comment = {
    id: generateId(),
    postId: currentViewPostId,
    author: author,
    text: text,
    createdAt: Date.now()
  };

  dbPut('comments', comment, function () {
    document.getElementById('commentText').value = '';
    loadComments(currentViewPostId);
    blogToast('Comment posted!');
  });
}

function deleteComment(commentId) {
  dbDelete('comments', commentId, function () {
    loadComments(currentViewPostId);
    blogToast('Comment deleted');
  });
}

// ===== Utility Functions =====
function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function formatDate(timestamp) {
  var d = new Date(timestamp);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function blogToast(msg) {
  var toast = document.getElementById('blogToast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 2800);
}

// ===== Character / Word Counts =====
function updateCharCounts() {
  var titleEl = document.getElementById('postTitle');
  var excerptEl = document.getElementById('postExcerpt');
  var contentEl = document.getElementById('postContent');

  if (titleEl) document.getElementById('titleCharCount').textContent = titleEl.value.length;
  if (excerptEl) document.getElementById('excerptCharCount').textContent = excerptEl.value.length;
  if (contentEl) {
    var text = contentEl.innerText || contentEl.textContent || '';
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('wordCount').textContent = words;
  }
}

// ===== Cover Image Preview =====
function previewCoverImage() {
  var url = document.getElementById('postCoverImage').value.trim();
  var preview = document.getElementById('coverPreview');
  if (url) {
    preview.innerHTML = '<img src="' + escapeHtml(url) + '" alt="Cover preview" onerror="this.parentElement.classList.remove(\'has-image\'); this.parentElement.innerHTML=\'\'">';
    preview.classList.add('has-image');
  } else {
    preview.innerHTML = '';
    preview.classList.remove('has-image');
  }
}

// ===== Tags Preview =====
function previewTags() {
  var raw = document.getElementById('postTags').value;
  var preview = document.getElementById('tagsPreview');
  var tags = raw.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  preview.innerHTML = '';
  tags.forEach(function (tag) {
    var span = document.createElement('span');
    span.className = 'tag-chip';
    span.textContent = tag;
    preview.appendChild(span);
  });
}

// ===== Event Listeners Setup =====
function setupBlogEventListeners() {
  var titleInput = document.getElementById('postTitle');
  var excerptInput = document.getElementById('postExcerpt');
  var contentDiv = document.getElementById('postContent');
  var coverInput = document.getElementById('postCoverImage');
  var tagsInput = document.getElementById('postTags');

  if (titleInput) titleInput.addEventListener('input', updateCharCounts);
  if (excerptInput) excerptInput.addEventListener('input', updateCharCounts);
  if (contentDiv) contentDiv.addEventListener('input', updateCharCounts);
  if (coverInput) coverInput.addEventListener('input', previewCoverImage);
  if (tagsInput) tagsInput.addEventListener('input', previewTags);

  // Close modals on overlay click
  document.getElementById('editorModal').addEventListener('click', function (e) {
    if (e.target === this) closeEditor();
  });
  document.getElementById('viewerModal').addEventListener('click', function (e) {
    if (e.target === this) closeViewer();
  });
  document.getElementById('deleteModal').addEventListener('click', function (e) {
    if (e.target === this) closeDeleteModal();
  });

  // Keyboard shortcut: Escape to close modals
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (document.getElementById('deleteModal').classList.contains('active')) {
        closeDeleteModal();
      } else if (document.getElementById('viewerModal').classList.contains('active')) {
        closeViewer();
      } else if (document.getElementById('editorModal').classList.contains('active')) {
        closeEditor();
      }
    }
  });
}

// ===== Initialize Blog Platform =====
(function initBlogPlatform() {
  openBlogDB(function () {
    seedDefaultPosts(function () {
      renderBlogPosts();
    });
    setupBlogEventListeners();
  });
})();
