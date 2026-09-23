# download_weights.py
from huggingface_hub import list_repo_files, hf_hub_download

repo = "fabiocigaina/TACO-yolo11s"
files = list_repo_files(repo)
print("Repodaki dosyalar:", files)

pt_files = [f for f in files if f.endswith(".pt")]
if not pt_files:
    raise SystemExit(".pt dosyası bulunamadı")

path = hf_hub_download(repo_id=repo, filename=pt_files[0], local_dir="weights")
print("İndirildi:", path)