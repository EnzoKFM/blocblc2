const { pool } = require('../config/db');

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);

        if (comments.length === 0) return res.status(404).json({ message: 'Comment not found' });
        if (comments[0].user_id !== req.userId) return res.status(403).json({ message: 'Not authorized' });

        await pool.query(
            'UPDATE comments SET content = ? WHERE id = ?',
            [content, req.params.id]
        );

        res.json({ message: 'Comment updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);

        if (comments.length === 0) return res.status(404).json({ message: 'Article not found' });
        if (comments[0].user_id !== req.userId) return res.status(403).json({ message: 'Not authorized' });

        await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
