import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2, Calendar, User } from 'lucide-react';

const ArticleDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();


    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const { data } = await API.get(`/articles/${id}`);
                setArticle(data);

                const { data: commentsData } = await API.get(`/articles/${id}/comments`);
                setComments(commentsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
            try {
                await API.delete(`/articles/${id}`);
                navigate('/');
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data } = await API.post(`/articles/${id}/comments`, {
                content: newComment,
                user_id: user.id
            });

            const { data: comments } = await API.get(`/articles/${id}/comments`);
            setComments(comments);

            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Supprimer ce commentaire ?')) return;

        try {
            await API.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateComment = async (commentId) => {
        try {
            await API.put(`/comments/${commentId}`, {
                content: editingContent
            });

            const { data } = await API.get(`/articles/${id}/comments`);
            setComments(data);

            setEditingCommentId(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (!article) return <div>Article introuvable.</div>;

    const isOwner = user && user.id === article.user_id;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto' }}>
            <article>
                {article.image && (
                    <img
                        src={`http://localhost:5000${article.image}`}
                        alt={article.title}
                        style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', marginBottom: '30px' }}
                    />
                )}

                <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{article.title}</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {article.avatar ? (
                            <img src={`http://localhost:5000${article.avatar}`} alt={article.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        ) : <User />}
                        <div>
                            <Link to={`/profile/${article.user_id}`} style={{ fontWeight: 'bold' }}>{article.username}</Link>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar size={14} /> {new Date(article.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Link to={`/edit/${id}`} className="btn glass" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Edit size={16} /> Modifier
                            </Link>
                            <button onClick={handleDelete} className="btn" style={{ padding: '8px 12px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Trash2 size={16} /> Supprimer
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {article.content}
                </div>
            </article>
            <section style={{ marginTop: '50px' }}>
                <h2>Commentaires ({comments.length})</h2>

                {user && (
                    <form onSubmit={handleAddComment} style={{ marginBottom: '30px' }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            style={{ width: '100%', padding: '10px', minHeight: '80px' }}
                        />
                        <button type="submit" className="btn" style={{ marginTop: '10px' }}>
                            Publier
                        </button>
                    </form>
                )}
                
                {comments.map(comment => {
                    const isCommentOwner = user && user.id === comment.user_id;

                    return (
                        <div key={comment.id} style={{
                            borderBottom: '1px solid #ccc',
                            padding: '15px 0'
                        }}>
                            <strong>{comment.username}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#777' }}>
                                {new Date(comment.created_at).toLocaleDateString()}
                            </div>

                            {editingCommentId === comment.id ? (
                                <>
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        style={{ width: '100%', marginTop: '10px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleUpdateComment(comment.id)} className='btn' style={{ padding: '8px 12px', background: '#13b33b', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            Enregistrer
                                        </button>
                                        <button onClick={() => setEditingCommentId(null)} className='btn' style={{ padding: '8px 12px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            Annuler
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p style={{ marginTop: '10px', marginBottom: '10px' }}>
                                    {comment.content}
                                </p>
                            )}

                            {isCommentOwner && editingCommentId !== comment.id && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditingContent(comment.content);
                                        }}
                                        className="btn glass"
                                        style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '5px', color: 'white' }}
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="btn"
                                        style={{ padding: '8px 12px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>
        </div>
    );
};

export default ArticleDetail;
