import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('ws://localhost:8000/api/v1/notifications/ws?token=test') as ws:
            print('Connected!')
            res = await ws.recv()
            print('Received:', res)
    except Exception as e:
        print('Error:', type(e), e)

asyncio.run(test())
