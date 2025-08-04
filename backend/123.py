import asyncio
import time
import dns.resolver

# 要测试的 DNS 服务器
dns_servers = [
    "211.138.151.161", "211.138.156.66",
    "218.207.217.241", "218.207.217.242",
    "211.143.181.178", "211.143.181.179",
    "218.207.128.4", "218.207.130.118",
    "211.138.145.194"
]

# 测试域名列表
domains = ["bilibili.com", "xiaohongshu.com"]

async def query_one(server_ip, domain):
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [server_ip]
    resolver.lifetime = 2
    start = time.time()
    try:
        ans = await asyncio.get_event_loop().run_in_executor(None, resolver.resolve, domain)
        latency = (time.time() - start) * 1000
        return server_ip, domain, round(latency, 2), True, [str(r) for r in ans]
    except Exception as e:
        return server_ip, domain, None, False, None

async def main():
    tasks = []
    for ip in dns_servers:
        for d in domains:
            tasks.append(query_one(ip, d))
    results = await asyncio.gather(*tasks)

    # 分输出
    print(f"{'DNS Server':<18} {'Domain':<16} {'Latency(ms)':<12} {'OK'} {'IPs'}")
    for srv, dom, lat, ok, ips in results:
        print(f"{srv:<18} {dom:<16} {lat if lat else 'Timeout':<12} { '✅' if ok else '❌'} {','.join(ips) if ips else ''}")

if __name__ == '__main__':
    asyncio.run(main())
