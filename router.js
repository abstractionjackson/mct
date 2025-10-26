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
    
    init() {
        const handleRoute = () => {
            const path = window.location.hash.slice(1) || '/';
            const handler = this.routes[path] || this.routes['/'];
            
            if (handler && this.currentRoute !== path) {
                this.currentRoute = path;
                handler();
            }
        };
        
        window.addEventListener('hashchange', handleRoute);
        handleRoute();
    }
};
