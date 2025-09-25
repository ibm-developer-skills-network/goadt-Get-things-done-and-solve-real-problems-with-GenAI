from __future__ import annotations

import os
from flask import Flask, jsonify, send_from_directory
from werkzeug.middleware.proxy_fix import ProxyFix

from routes.coffee_routes import coffee_bp


def _static_path(*parts: str) -> str:
    return os.path.join(os.path.dirname(__file__), 'public', *parts)


def create_app() -> Flask:
    app = Flask(__name__, static_folder=None)
    app.wsgi_app = ProxyFix(app.wsgi_app)  # type: ignore

    # API routes
    app.register_blueprint(coffee_bp, url_prefix='/api/coffees')

    # Static: js/css served from pythonversion/src/public
    @app.get('/js/<path:filename>')
    def serve_js(filename: str):
        return send_from_directory(_static_path('js'), filename)

    @app.get('/css/<path:filename>')
    def serve_css(filename: str):
        return send_from_directory(_static_path('css'), filename)

    # Images: try local pythonversion/src/public/images, else fall back to original repo src/public/images
    @app.get('/images/<path:filename>')
    def serve_images(filename: str):
        local_img_dir = _static_path('images')
        original_img_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'src', 'public', 'images')
        if os.path.exists(os.path.join(local_img_dir, filename)):
            return send_from_directory(local_img_dir, filename)
        return send_from_directory(original_img_dir, filename)

    @app.get('/')
    def index():
        return send_from_directory(_static_path(), 'index.html')

    @app.get('/<path:subpath>')
    def catchall(subpath: str):
        # Single-page style routing to index
        return send_from_directory(_static_path(), 'index.html')

    return app


if __name__ == '__main__':
    port = int(os.getenv('PORT', '3000'))
    app = create_app()
    app.run(host='0.0.0.0', port=port, debug=True)

