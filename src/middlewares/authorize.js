export default function authorize(roles = []) {
    return (req, res, next) => {

        if (!req.userRoles) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        if (roles.length === 0) return next();

        const allowed = req.userRoles.some(r => roles.includes(r));

        if (!allowed) {
            return res.status(403).json({ message: 'Prohibido' });
        }

        next();
    };
}