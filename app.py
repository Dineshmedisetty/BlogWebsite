from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)
    likes = db.relationship('Like', backref='user', lazy=True)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    likes = db.relationship('Like', backref='post', lazy=True, cascade='all, delete-orphan')
    
    @property
    def like_count(self):
        return len(self.likes)
    
    @property
    def comment_count(self):
        return len(self.comments)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_like'),)

# Helper Functions
def is_logged_in():
    return 'user_id' in session

def get_current_user():
    if is_logged_in():
        return User.query.get(session['user_id'])
    return None

def is_author(post):
    current_user = get_current_user()
    return current_user and current_user.id == post.user_id

# Routes
@app.route('/')
def index():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return render_template('index.html', posts=posts, current_user=get_current_user())

@app.route('/post/<int:post_id>')
def view_post(post_id):
    post = Post.query.get_or_404(post_id)
    return render_template('post_detail.html', post=post, current_user=get_current_user())

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Logged in successfully!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return render_template('register.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return render_template('register.html')
        
        # Create new user
        password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, email=email, password_hash=password_hash)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('index'))

@app.route('/create_post', methods=['GET', 'POST'])
def create_post():
    if not is_logged_in():
        flash('Please log in to create posts', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        
        post = Post(title=title, content=content, user_id=session['user_id'])
        db.session.add(post)
        db.session.commit()
        
        flash('Post created successfully!', 'success')
        return redirect(url_for('view_post', post_id=post.id))
    
    return render_template('create_post.html', current_user=get_current_user())

@app.route('/edit_post/<int:post_id>', methods=['GET', 'POST'])
def edit_post(post_id):
    if not is_logged_in():
        flash('Please log in to edit posts', 'error')
        return redirect(url_for('login'))
    
    post = Post.query.get_or_404(post_id)
    
    if not is_author(post):
        flash('You can only edit your own posts', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        post.title = request.form['title']
        post.content = request.form['content']
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        flash('Post updated successfully!', 'success')
        return redirect(url_for('view_post', post_id=post.id))
    
    return render_template('edit_post.html', post=post, current_user=get_current_user())

@app.route('/delete_post/<int:post_id>', methods=['POST'])
def delete_post(post_id):
    if not is_logged_in():
        flash('Please log in to delete posts', 'error')
        return redirect(url_for('login'))
    
    post = Post.query.get_or_404(post_id)
    
    if not is_author(post):
        flash('You can only delete your own posts', 'error')
        return redirect(url_for('index'))
    
    db.session.delete(post)
    db.session.commit()
    
    flash('Post deleted successfully!', 'success')
    return redirect(url_for('index'))

# API Endpoints
@app.route('/api/like_post', methods=['POST'])
def like_post():
    try:
        if not is_logged_in():
            return jsonify({'success': False, 'message': 'Please log in to like posts'})
        
        data = request.get_json()
        if not data or 'post_id' not in data:
            return jsonify({'success': False, 'message': 'Invalid request data'})
        
        post_id = data.get('post_id')
        post = Post.query.get(post_id)
        
        if not post:
            return jsonify({'success': False, 'message': 'Post not found'})
        
        user_id = session['user_id']
        
        # Check if user already liked this post
        existing_like = Like.query.filter_by(user_id=user_id, post_id=post_id).first()
        
        if existing_like:
            # Unlike the post
            db.session.delete(existing_like)
            db.session.commit()
            # Refresh the post to get updated like count
            db.session.refresh(post)
            return jsonify({'success': True, 'liked': False, 'like_count': len(post.likes)})
        else:
            # Like the post
            like = Like(user_id=user_id, post_id=post_id)
            db.session.add(like)
            db.session.commit()
            # Refresh the post to get updated like count
            db.session.refresh(post)
            return jsonify({'success': True, 'liked': True, 'like_count': len(post.likes)})
            
    except Exception as e:
        print(f"Error in like_post: {e}")
        return jsonify({'success': False, 'message': 'Please try again'})

@app.route('/api/add_comment', methods=['POST'])
def add_comment():
    if not is_logged_in():
        return jsonify({'success': False, 'message': 'Please log in to comment'})
    
    post_id = request.json.get('post_id')
    content = request.json.get('content')
    
    if not content.strip():
        return jsonify({'success': False, 'message': 'Comment cannot be empty'})
    
    post = Post.query.get_or_404(post_id)
    comment = Comment(content=content, user_id=session['user_id'], post_id=post_id)
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'author': comment.author.username,
            'created_at': comment.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    })

@app.route('/api/delete_comment/<int:comment_id>', methods=['POST'])
def delete_comment(comment_id):
    if not is_logged_in():
        return jsonify({'success': False, 'message': 'Please log in'})
    
    comment = Comment.query.get_or_404(comment_id)
    current_user = get_current_user()
    
    # Users can only delete their own comments or comments on their posts
    if comment.user_id != current_user.id and comment.post.user_id != current_user.id:
        return jsonify({'success': False, 'message': 'You can only delete your own comments'})
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Database tables created successfully
    
    app.run(debug=True)
