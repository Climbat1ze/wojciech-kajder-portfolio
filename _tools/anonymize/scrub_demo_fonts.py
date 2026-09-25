from pathlib import Path
root = Path(r"C:\Repos\wojciech-kajder-portfolio\case-studies\01-pm-helper\project\_demo")
fm = [('"Samsung Sharp Sans",',''),('"SamsungOne",',''),('"Samsung Sharp Sans"','"Poppins"'),('"SamsungOne"','"Inter"')]
c=0
for p in list(root.rglob("*.html"))+list(root.rglob("*.css")):
    t=p.read_text(encoding="utf-8"); n=0
    for a,b in fm: n+=t.count(a); t=t.replace(a,b)
    if n: p.write_text(t,encoding="utf-8"); c+=1
print(f"scrubbed {c} files")
