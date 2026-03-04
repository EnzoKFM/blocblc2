const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const purify = DOMPurify(window);

const sanitizeCommentMiddleware = (req, res, next) => {
    try {
        if (!req.body || !req.body.content) {
            return res.status(400).json({
                error: "Commentaire manquant"
            });
        }

        const originalComment = req.body.content;

        // Nettoyage strict : on interdit le HTML
        const sanitizedComment = purify.sanitize(originalComment, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });

        // Si modification après sanitation → tentative d'injection
        if (sanitizedComment !== originalComment) {
            return res.status(403).json({
                error: "Contenu du commentaire invalide (XSS détecté)"
            });
        }

        // Remplacer le commentaire par la version safe
        req.body.comment = sanitizedComment;

        next();
    } catch (err) {
        console.error("XSS Middleware Error:", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = sanitizeCommentMiddleware;