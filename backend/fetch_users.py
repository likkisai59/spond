import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Python 3.13 on Windows has a broken Windows certificate store integration
import ssl as _ssl
import os as _os
_orig_create_default_context = _ssl.create_default_context
def _patched_create_default_context(*args, **kwargs):
    ctx = _orig_create_default_context(*args, **kwargs)
    ctx.check_hostname = False
    ctx.verify_mode = _ssl.CERT_NONE
    return ctx
_ssl.create_default_context = _patched_create_default_context

async def main():
    client = AsyncIOMotorClient('mongodb+srv://santhoshlider_db_user:Santhosh%40123@cluster0.icdtjyx.mongodb.net/unify_platform?retryWrites=true&w=majority')
    db = client['unify_platform']
    users = await db.users.find({}).to_list(100)
    for u in users:
        print(f"Email: {u.get('email')}, Role: {u.get('role')}")

asyncio.run(main())
