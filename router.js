// Simple hash-based router
const Router = {
    routes: {},
    currentRoute: null,
    
    register(path, handler) {
        this.routes[path] = handler;
    },
    
    navigate(path) {
        window.location.hash = path;
    },
    
    getQueryParams() {
        const hash = window.location.hash;
        const queryString = hash.split('?')[1];
        if (!queryString) return {};
        
        const params = {};
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = value;
        });
        return params;
    },
    
    init() {
        const handleRoute = () => {
            const fullHash = window.location.hash.slice(1) || '/';
            const path = fullHash.split('?')[0];
            const handler = this.routes[path] || this.routes['/'];
            
            if (handler && this.currentRoute !== fullHash) {
                this.currentRoute = fullHash;
                handler();
            }
        };
        
        window.addEventListener('hashchange', handleRoute);
        handleRoute();
    }
};
