import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Bypass Windows SSL certificate issues for local Python
import ssl as _ssl
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
    
    # Bcrypt hash for "Password@123"
    hashed_password = "$2b$12$NCqAmFa/ZprnXdnBcsdaR.CRgua9z0XUJZMAig3TX/kMCHyZTdsLC"
    
    # Reset all users' passwords to Password@123
    result = await db.users.update_many({}, {"$set": {"password_hash": hashed_password}})
    print(f"Success! Reset passwords for {result.modified_count} users to: Password@123")

asyncio.run(main())
