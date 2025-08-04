#
#  Copyright 2024 The InfiniFlow Authors. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

from flask import Blueprint, jsonify
import logging

health_bp = Blueprint("health", __name__)


@health_bp.route("/internal/liveness")
def liveness():
    """Kubernetes liveness probe - is the container alive?"""
    return jsonify({"ok": True, "status": "alive"})


@health_bp.route("/internal/readiness")
def readiness():
    """Kubernetes readiness probe - can it serve traffic?"""
    try:
        # Test database connection
        from api.db.services.user_service import UserService

        try:
            UserService.query(limit=1)
            db_status = "connected"
        except Exception as e:
            logging.warning(f"Database health check failed: {e}")
            db_status = "failed"

        # Test Redis connection
        from rag.utils.redis_conn import RedisDB

        try:
            RedisDB().ping()
            redis_status = "connected"
        except Exception as e:
            logging.warning(f"Redis health check failed: {e}")
            redis_status = "failed"

        # Test MinIO connection
        from rag.utils.minio_conn import RAGFlowMinio

        try:
            minio = RAGFlowMinio()
            minio.health()
            minio_status = "connected"
        except Exception as e:
            logging.warning(f"MinIO health check failed: {e}")
            minio_status = "failed"

        # Test document engine connection (Infinity)
        try:
            from api import settings

            if hasattr(settings, "docStoreConn") and settings.docStoreConn:
                settings.docStoreConn.health()
                doc_engine_status = "connected"
            else:
                doc_engine_status = "not_initialized"
        except Exception as e:
            logging.warning(f"Document engine health check failed: {e}")
            doc_engine_status = "failed"

        # Determine overall readiness
        critical_services = [db_status, redis_status]
        if all(status == "connected" for status in critical_services):
            return jsonify(
                {
                    "ok": True,
                    "status": "ready",
                    "services": {
                        "database": db_status,
                        "redis": redis_status,
                        "minio": minio_status,
                        "doc_engine": doc_engine_status,
                    },
                }
            )
        else:
            return (
                jsonify(
                    {
                        "ok": False,
                        "status": "not_ready",
                        "services": {
                            "database": db_status,
                            "redis": redis_status,
                            "minio": minio_status,
                            "doc_engine": doc_engine_status,
                        },
                    }
                ),
                503,
            )

    except Exception as e:
        logging.error(f"Health check error: {e}")
        return jsonify({"ok": False, "error": str(e), "status": "error"}), 503


@health_bp.route("/internal/metrics")
def metrics():
    """Prometheus metrics endpoint"""
    try:
        from prometheus_client import generate_latest, REGISTRY

        return generate_latest(REGISTRY), 200, {"Content-Type": "text/plain"}
    except ImportError:
        # Fallback if prometheus_client is not available
        return (
            "# Prometheus client not available\n",
            200,
            {"Content-Type": "text/plain"},
        )
    except Exception as e:
        logging.error(f"Metrics endpoint error: {e}")
        return (
            f"# Error generating metrics: {str(e)}\n",
            500,
            {"Content-Type": "text/plain"},
        )
