import os
import re
import json
import ssl
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

RAW_TEXT = """
==================== BERMUDA ====================

MAP
https://ranaesp.online/app-data/maps/bermuda.jpg

BIMASAKTI STRIP
https://ranaesp.online/app-data/bermuda/bimasaktistrip1.png
https://ranaesp.online/app-data/bermuda/bimasaktistrip2.png
https://ranaesp.online/app-data/bermuda/bimasaktistrip3.png
https://ranaesp.online/app-data/bermuda/bimasaktistrip4.png
https://ranaesp.online/app-data/bermuda/bimasaktistrip5.png

BULLSEYE
https://ranaesp.online/app-data/bermuda/bullseye1.png
https://ranaesp.online/app-data/bermuda/bullseye2.png
https://ranaesp.online/app-data/bermuda/bullseye3.png
https://ranaesp.online/app-data/bermuda/bullseye4.png
https://ranaesp.online/app-data/bermuda/bullseye5.png

CAPE TOWN
https://ranaesp.online/app-data/bermuda/capetown1.png
https://ranaesp.online/app-data/bermuda/capetown2.png
https://ranaesp.online/app-data/bermuda/capetown3.png
https://ranaesp.online/app-data/bermuda/capetown4.png
https://ranaesp.online/app-data/bermuda/capetown5.png

CLOCK TOWER
https://ranaesp.online/app-data/bermuda/clocktower1.png
https://ranaesp.online/app-data/bermuda/clocktower2.png
https://ranaesp.online/app-data/bermuda/clocktower3.png
https://ranaesp.online/app-data/bermuda/clocktower4.png
https://ranaesp.online/app-data/bermuda/clocktower5.png

FACTORY
https://ranaesp.online/app-data/bermuda/factory1.png
https://ranaesp.online/app-data/bermuda/factory2.png
https://ranaesp.online/app-data/bermuda/factory3.png
https://ranaesp.online/app-data/bermuda/factory4.png
https://ranaesp.online/app-data/bermuda/factory5.png

GRAVEYARD
https://ranaesp.online/app-data/bermuda/graveyard1.png
https://ranaesp.online/app-data/bermuda/graveyard2.png
https://ranaesp.online/app-data/bermuda/graveyard3.png
https://ranaesp.online/app-data/bermuda/graveyard4.png
https://ranaesp.online/app-data/bermuda/graveyard5.png

HANGER
https://ranaesp.online/app-data/bermuda/hanger1.png
https://ranaesp.online/app-data/bermuda/hanger2.png
https://ranaesp.online/app-data/bermuda/hanger3.png
https://ranaesp.online/app-data/bermuda/hanger4.png
https://ranaesp.online/app-data/bermuda/hanger5.png

KATULISTIWA
https://ranaesp.online/app-data/bermuda/katulistiwa1.png
https://ranaesp.online/app-data/bermuda/katulistiwa2.png
https://ranaesp.online/app-data/bermuda/katulistiwa3.png
https://ranaesp.online/app-data/bermuda/katulistiwa4.png
https://ranaesp.online/app-data/bermuda/katulistiwa5.png

MARS ELECTRIC
https://ranaesp.online/app-data/bermuda/marselectric1.png
https://ranaesp.online/app-data/bermuda/marselectric2.png
https://ranaesp.online/app-data/bermuda/marselectric3.png
https://ranaesp.online/app-data/bermuda/marselectric4.png
https://ranaesp.online/app-data/bermuda/marselectric5.png

MILL
https://ranaesp.online/app-data/bermuda/mill1.png
https://ranaesp.online/app-data/bermuda/mill2.png
https://ranaesp.online/app-data/bermuda/mill3.png
https://ranaesp.online/app-data/bermuda/mill4.png
https://ranaesp.online/app-data/bermuda/mill5.png
https://ranaesp.online/app-data/bermuda/mill6.png

OBSERVATORY
https://ranaesp.online/app-data/bermuda/observatory1.png
https://ranaesp.online/app-data/bermuda/observatory2.png
https://ranaesp.online/app-data/bermuda/observatory3.png
https://ranaesp.online/app-data/bermuda/observatory4.png
https://ranaesp.online/app-data/bermuda/observatory5.png

PEAK
https://ranaesp.online/app-data/bermuda/peak1.png
https://ranaesp.online/app-data/bermuda/peak2.png
https://ranaesp.online/app-data/bermuda/peak3.png
https://ranaesp.online/app-data/bermuda/peak4.png
https://ranaesp.online/app-data/bermuda/peak5.png
https://ranaesp.online/app-data/bermuda/peak6.png

PLANTATION
https://ranaesp.online/app-data/bermuda/plantation1.png
https://ranaesp.online/app-data/bermuda/plantation2.png
https://ranaesp.online/app-data/bermuda/plantation3.png
https://ranaesp.online/app-data/bermuda/plantation4.png
https://ranaesp.online/app-data/bermuda/plantation5.png

POCHINOK
https://ranaesp.online/app-data/bermuda/pochinok1.png
https://ranaesp.online/app-data/bermuda/pochinok2.png
https://ranaesp.online/app-data/bermuda/pochinok3.png
https://ranaesp.online/app-data/bermuda/pochinok4.png
https://ranaesp.online/app-data/bermuda/pochinok5.png

RIM NAM VILLAGE
https://ranaesp.online/app-data/bermuda/rimnamvillage1.png
https://ranaesp.online/app-data/bermuda/rimnamvillage2.png
https://ranaesp.online/app-data/bermuda/rimnamvillage3.png
https://ranaesp.online/app-data/bermuda/rimnamvillage4.png
https://ranaesp.online/app-data/bermuda/rimnamvillage5.png

SENTOSA
https://ranaesp.online/app-data/bermuda/sentosa1.png
https://ranaesp.online/app-data/bermuda/sentosa2.png
https://ranaesp.online/app-data/bermuda/sentosa3.png
https://ranaesp.online/app-data/bermuda/sentosa4.png
https://ranaesp.online/app-data/bermuda/sentosa5.png

SHIPYARD
https://ranaesp.online/app-data/bermuda/shipyard1.png
https://ranaesp.online/app-data/bermuda/shipyard2.png
https://ranaesp.online/app-data/bermuda/shipyard3.png
https://ranaesp.online/app-data/bermuda/shipyard4.png
https://ranaesp.online/app-data/bermuda/shipyard5.png


==================== KALAHARI ====================

MAP
https://ranaesp.online/app-data/maps/kalahari.jpg

BAYFRONT
https://ranaesp.online/app-data/kalahari/bayfront1.png
https://ranaesp.online/app-data/kalahari/bayfront2.png
https://ranaesp.online/app-data/kalahari/bayfront3.png
https://ranaesp.online/app-data/kalahari/bayfront4.png

COMMAND POST
https://ranaesp.online/app-data/kalahari/commandpost1.png
https://ranaesp.online/app-data/kalahari/commandpost2.png
https://ranaesp.online/app-data/kalahari/commandpost3.png
https://ranaesp.online/app-data/kalahari/commandpost4.png

CONFINEMENT
https://ranaesp.online/app-data/kalahari/confinement1.png
https://ranaesp.online/app-data/kalahari/confinement2.png
https://ranaesp.online/app-data/kalahari/confinement3.png
https://ranaesp.online/app-data/kalahari/confinement4.png

COUNCIL HALL
https://ranaesp.online/app-data/kalahari/councilhall1.png
https://ranaesp.online/app-data/kalahari/councilhall2.png
https://ranaesp.online/app-data/kalahari/councilhall3.png
https://ranaesp.online/app-data/kalahari/councilhall4.png

FOUNDATION
https://ranaesp.online/app-data/kalahari/foundation1.png
https://ranaesp.online/app-data/kalahari/foundation2.png
https://ranaesp.online/app-data/kalahari/foundation3.png
https://ranaesp.online/app-data/kalahari/foundation4.png

MAMMOTH
https://ranaesp.online/app-data/kalahari/mammoth1.png
https://ranaesp.online/app-data/kalahari/mammoth2.png
https://ranaesp.online/app-data/kalahari/mammoth3.png
https://ranaesp.online/app-data/kalahari/mammoth4.png

OLD HAMPTON
https://ranaesp.online/app-data/kalahari/oldhampton1.png
https://ranaesp.online/app-data/kalahari/oldhampton2.png
https://ranaesp.online/app-data/kalahari/oldhampton3.png
https://ranaesp.online/app-data/kalahari/oldhampton4.png

REFINERY
https://ranaesp.online/app-data/kalahari/refinery1.png
https://ranaesp.online/app-data/kalahari/refinery2.png
https://ranaesp.online/app-data/kalahari/refinery3.png
https://ranaesp.online/app-data/kalahari/refinery4.png

SANTA CATARINA
https://ranaesp.online/app-data/kalahari/sentacatarina1.png
https://ranaesp.online/app-data/kalahari/sentacatarina2.png
https://ranaesp.online/app-data/kalahari/sentacatarina3.png
https://ranaesp.online/app-data/kalahari/sentacatarina4.png

SHRINES
https://ranaesp.online/app-data/kalahari/shrines1.png
https://ranaesp.online/app-data/kalahari/shrines2.png
https://ranaesp.online/app-data/kalahari/shrines3.png
https://ranaesp.online/app-data/kalahari/shrines4.png

STONE RIDGE
https://ranaesp.online/app-data/kalahari/stoneridge1.png
https://ranaesp.online/app-data/kalahari/stoneridge2.png
https://ranaesp.online/app-data/kalahari/stoneridge3.png
https://ranaesp.online/app-data/kalahari/stoneridge4.png

THE MAZE
https://ranaesp.online/app-data/kalahari/themaze1.png
https://ranaesp.online/app-data/kalahari/themaze2.png
https://ranaesp.online/app-data/kalahari/themaze3.png
https://ranaesp.online/app-data/kalahari/themaze4.png

THE SUB
https://ranaesp.online/app-data/kalahari/thesub1.png
https://ranaesp.online/app-data/kalahari/thesub2.png
https://ranaesp.online/app-data/kalahari/thesub3.png
https://ranaesp.online/app-data/kalahari/thesub4.png


==================== ALPINE ====================

MAP
https://ranaesp.online/app-data/maps/alpine.jpg

DRONE VIEWS
No separate Alpine drone-view URLs are referenced in the APK bundle.


==================== PURGATORY ====================

MAP
https://ranaesp.online/app-data/maps/purgatory.jpg

BRASILIA
https://ranaesp.online/app-data/purgatory/brasilia1.jpg

CENTRAL
https://ranaesp.online/app-data/purgatory/central1.jpg
https://ranaesp.online/app-data/purgatory/central2.jpg

FORGE
https://ranaesp.online/app-data/purgatory/forge1.jpg

GOLF COURSE
https://ranaesp.online/app-data/purgatory/golfcourse1.jpg

LUMBER MILL
https://ranaesp.online/app-data/purgatory/lumbermill1.jpg

MARBLEWORKS
https://ranaesp.online/app-data/purgatory/marbleworks1.jpg

MOATHOUSE
https://ranaesp.online/app-data/purgatory/moathouse1.jpg
https://ranaesp.online/app-data/purgatory/moathouse2.jpg

MT. VILLA
https://ranaesp.online/app-data/purgatory/mt.villa1.jpg

SKI LODGE
https://ranaesp.online/app-data/purgatory/skilodge1.jpg


==================== NEXTERA ====================

MAP
https://ranaesp.online/app-data/maps/nexterra.jpg

BOXING GYM
https://ranaesp.online/app-data/nexterra/boxinggym1.png
https://ranaesp.online/app-data/nexterra/boxinggym2.png
https://ranaesp.online/app-data/nexterra/boxinggym3.png
https://ranaesp.online/app-data/nexterra/boxinggym4.png

DECA SQUARE
https://ranaesp.online/app-data/nexterra/decasquare1.png
https://ranaesp.online/app-data/nexterra/decasquare2.png
https://ranaesp.online/app-data/nexterra/decasquare3.png
https://ranaesp.online/app-data/nexterra/decasquare4.png

FARMTOPIA
https://ranaesp.online/app-data/nexterra/farmtopia1.png
https://ranaesp.online/app-data/nexterra/farmtopia2.png
https://ranaesp.online/app-data/nexterra/farmtopia3.png
https://ranaesp.online/app-data/nexterra/farmtopia4.png

GRAV LABS
https://ranaesp.online/app-data/nexterra/gravlabs1.png
https://ranaesp.online/app-data/nexterra/gravlabs2.png
https://ranaesp.online/app-data/nexterra/gravlabs3.png
https://ranaesp.online/app-data/nexterra/gravlabs4.png

INTELLECT CENTER
https://ranaesp.online/app-data/nexterra/intellectcenter1.png
https://ranaesp.online/app-data/nexterra/intellectcenter2.png
https://ranaesp.online/app-data/nexterra/intellectcenter3.png
https://ranaesp.online/app-data/nexterra/intellectcenter4.png

MORTAR RUINS
https://ranaesp.online/app-data/nexterra/mortarruins1.png
https://ranaesp.online/app-data/nexterra/mortarruins2.png
https://ranaesp.online/app-data/nexterra/mortarruins3.png
https://ranaesp.online/app-data/nexterra/mortarruins4.png

MUD SITE
https://ranaesp.online/app-data/nexterra/mudsite1.png
https://ranaesp.online/app-data/nexterra/mudsite2.png
https://ranaesp.online/app-data/nexterra/mudsite3.png
https://ranaesp.online/app-data/nexterra/mudsite4.png

MUSEUM
https://ranaesp.online/app-data/nexterra/museum1.png
https://ranaesp.online/app-data/nexterra/museum2.png
https://ranaesp.online/app-data/nexterra/museum3.png
https://ranaesp.online/app-data/nexterra/museum4.png

PLAZARIA
https://ranaesp.online/app-data/nexterra/plazaria1.png
https://ranaesp.online/app-data/nexterra/plazaria2.png
https://ranaesp.online/app-data/nexterra/plazaria3.png
https://ranaesp.online/app-data/nexterra/plazaria4.png

RUST TOWN
https://ranaesp.online/app-data/nexterra/rusttown1.png
https://ranaesp.online/app-data/nexterra/rusttown2.png
https://ranaesp.online/app-data/nexterra/rusttown3.png
https://ranaesp.online/app-data/nexterra/rusttown4.png

TURBINE
https://ranaesp.online/app-data/nexterra/turbine1.png
https://ranaesp.online/app-data/nexterra/turbine2.png
https://ranaesp.online/app-data/nexterra/turbine3.png

TWIN BRIDGE
https://ranaesp.online/app-data/nexterra/twinbridge1.png
https://ranaesp.online/app-data/nexterra/twinbridge2.png
https://ranaesp.online/app-data/nexterra/twinbridge3.png
https://ranaesp.online/app-data/nexterra/twinbridge4.png

ZIPWAY
https://ranaesp.online/app-data/nexterra/zipway1.png
https://ranaesp.online/app-data/nexterra/zipway2.png
https://ranaesp.online/app-data/nexterra/zipway3.png
https://ranaesp.online/app-data/nexterra/zipway4.png


==================== SOLARA ====================

MAP
https://ranaesp.online/app-data/maps/solara.jpg

AQUARIUM
https://ranaesp.online/app-data/solara/aquarium1.png
https://ranaesp.online/app-data/solara/aquarium2.png
https://ranaesp.online/app-data/solara/aquarium3.png
https://ranaesp.online/app-data/solara/aquarium4.png

ARCHWAY
https://ranaesp.online/app-data/solara/archway1.png
https://ranaesp.online/app-data/solara/archway2.png
https://ranaesp.online/app-data/solara/archway3.png
https://ranaesp.online/app-data/solara/archway4.png

BAYSIDE
https://ranaesp.online/app-data/solara/bayside1.png
https://ranaesp.online/app-data/solara/bayside2.png
https://ranaesp.online/app-data/solara/bayside3.png
https://ranaesp.online/app-data/solara/bayside4.png
https://ranaesp.online/app-data/solara/bayside5.png

BLOOMTOWN
https://ranaesp.online/app-data/solara/bloomtown1.png
https://ranaesp.online/app-data/solara/bloomtown2.png
https://ranaesp.online/app-data/solara/bloomtown3.png
https://ranaesp.online/app-data/solara/bloomtown4.png
https://ranaesp.online/app-data/solara/bloomtown5.png

CASA VISTA
https://ranaesp.online/app-data/solara/casavista1.png
https://ranaesp.online/app-data/solara/casavista2.png
https://ranaesp.online/app-data/solara/casavista3.png
https://ranaesp.online/app-data/solara/casavista4.png
https://ranaesp.online/app-data/solara/casavista5.png

DELTA ISLE
https://ranaesp.online/app-data/solara/deltaisle1.png
https://ranaesp.online/app-data/solara/deltaisle2.png
https://ranaesp.online/app-data/solara/deltaisle3.png
https://ranaesp.online/app-data/solara/deltaisle4.png

ECO DRAIN
https://ranaesp.online/app-data/solara/ecodrain1.png
https://ranaesp.online/app-data/solara/ecodrain2.png
https://ranaesp.online/app-data/solara/ecodrain3.png
https://ranaesp.online/app-data/solara/ecodrain4.png
https://ranaesp.online/app-data/solara/ecodrain5.png

FUNFAIR
https://ranaesp.online/app-data/solara/funfair1.png
https://ranaesp.online/app-data/solara/funfair2.png
https://ranaesp.online/app-data/solara/funfair3.png
https://ranaesp.online/app-data/solara/funfair4.png
https://ranaesp.online/app-data/solara/funfair5.png

RIDERS CLUB
https://ranaesp.online/app-data/solara/ridersclub1.png
https://ranaesp.online/app-data/solara/ridersclub2.png
https://ranaesp.online/app-data/solara/ridersclub3.png
https://ranaesp.online/app-data/solara/ridersclub4.png

STUDIO
https://ranaesp.online/app-data/solara/studio1.png
https://ranaesp.online/app-data/solara/studio2.png
https://ranaesp.online/app-data/solara/studio3.png
https://ranaesp.online/app-data/solara/studio4.png

THE HUB
https://ranaesp.online/app-data/solara/thehub1.png
https://ranaesp.online/app-data/solara/thehub2.png
https://ranaesp.online/app-data/solara/thehub3.png
https://ranaesp.online/app-data/solara/thehub4.png
https://ranaesp.online/app-data/solara/thehub5.png

TV TOWER
https://ranaesp.online/app-data/solara/tvtower1.png
https://ranaesp.online/app-data/solara/tvtower2.png
https://ranaesp.online/app-data/solara/tvtower3.png
https://ranaesp.online/app-data/solara/tvtower4.png

WATERFALL
https://ranaesp.online/app-data/solara/waterfall1.png
https://ranaesp.online/app-data/solara/waterfall2.png
https://ranaesp.online/app-data/solara/waterfall3.png
https://ranaesp.online/app-data/solara/waterfall4.png

WINDMILL
https://ranaesp.online/app-data/solara/windmill1.png
https://ranaesp.online/app-data/solara/windmill2.png
https://ranaesp.online/app-data/solara/windmill3.png
https://ranaesp.online/app-data/solara/windmill4.png
https://ranaesp.online/app-data/solara/windmill5.png
"""

def parse_full_input(text):
    pattern = r'====================\s*([A-Z\s]+)\s*===================='
    splits = re.split(pattern, text)
    
    maps_data = {}
    
    for i in range(1, len(splits), 2):
        map_raw_name = splits[i].strip()
        content = splits[i+1].strip()
        
        map_id = map_raw_name.lower().replace(" ", "").replace("nextera", "nexterra")
        display_name = map_raw_name.title()
        if map_id == "nexterra":
            display_name = "Nexterra"
            
        map_record = {
            "id": map_id,
            "name": display_name,
            "src": "",
            "remoteMapUrl": "",
            "locations": []
        }
        
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        current_loc_name = None
        current_loc_urls = []
        
        idx = 0
        while idx < len(lines):
            line = lines[idx]
            if line == "MAP":
                idx += 1
                if idx < len(lines):
                    map_url = lines[idx]
                    ext = os.path.splitext(map_url)[1]
                    map_record["remoteMapUrl"] = map_url
                    map_record["src"] = f"/images/maps/{map_id}/{map_id}{ext}"
            elif line.startswith("http"):
                if current_loc_name:
                    current_loc_urls.append(line)
            elif line.startswith("DRONE VIEWS") or "No separate" in line:
                pass
            else:
                if current_loc_name and current_loc_urls:
                    loc_id = current_loc_name.lower().replace(" ", "-").replace(".", "")
                    map_record["locations"].append({
                        "id": loc_id,
                        "name": current_loc_name.title(),
                        "remoteUrls": current_loc_urls,
                        "droneViews": [
                            f"/images/maps/{map_id}/drone/{os.path.basename(u)}" for u in current_loc_urls
                        ]
                    })
                    current_loc_urls = []
                current_loc_name = line
            idx += 1
            
        if current_loc_name and current_loc_urls:
            loc_id = current_loc_name.lower().replace(" ", "-").replace(".", "")
            map_record["locations"].append({
                "id": loc_id,
                "name": current_loc_name.title(),
                "remoteUrls": current_loc_urls,
                "droneViews": [
                    f"/images/maps/{map_id}/drone/{os.path.basename(u)}" for u in current_loc_urls
                ]
            })
            
        maps_data[map_id] = map_record
        
    return maps_data

def download_asset(url, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    if os.path.exists(target_path) and os.path.getsize(target_path) > 500:
        return True, url, "Cached", os.path.getsize(target_path)
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                if resp.status == 200:
                    content = resp.read()
                    with open(target_path, 'wb') as f:
                        f.write(content)
                    return True, url, "OK", len(content)
        except Exception as e:
            if attempt == 2:
                return False, url, str(e), 0
    return False, url, "Max retries reached", 0

if __name__ == "__main__":
    workspace_root = "/Users/sainath/Desktop/RAVONIXX"
    maps_data = parse_full_input(RAW_TEXT)
    
    download_tasks = []
    
    for map_id, m in maps_data.items():
        if m["remoteMapUrl"]:
            ext = os.path.splitext(m["remoteMapUrl"])[1]
            local_map_file = os.path.join(workspace_root, "public", "images", "maps", map_id, f"{map_id}{ext}")
            download_tasks.append((m["remoteMapUrl"], local_map_file))
            
        for loc in m["locations"]:
            for u in loc["remoteUrls"]:
                filename = os.path.basename(u)
                local_drone_file = os.path.join(workspace_root, "public", "images", "maps", map_id, "drone", filename)
                download_tasks.append((u, local_drone_file))
                
    print(f"=== Starting Download of {len(download_tasks)} Assets ===")
    
    success_count = 0
    fail_count = 0
    failed_urls = []
    total_bytes = 0
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(download_asset, url, path): (url, path) for url, path in download_tasks}
        for future in as_completed(futures):
            ok, url, msg, size = future.result()
            if ok:
                success_count += 1
                total_bytes += size
            else:
                fail_count += 1
                failed_urls.append((url, msg))
                print(f"[FAILED] {url} -> {msg}")
                
    print(f"\nDownload Summary: {success_count} succeeded, {fail_count} failed. Total downloaded: {total_bytes / (1024*1024):.2f} MB")
    
    # Filter out failed URLs from locations so no broken images exist
    downloaded_files_set = set()
    for root, _, files in os.walk(os.path.join(workspace_root, "public", "images", "maps")):
        for f in files:
            if not f.startswith("."):
                downloaded_files_set.add(f)
                
    formatted_db = {}
    for map_id, m in maps_data.items():
        clean_locations = []
        for loc in m["locations"]:
            # Keep drone views that exist locally
            valid_drone_views = []
            valid_remote_urls = []
            for d_view, r_url in zip(loc["droneViews"], loc["remoteUrls"]):
                fname = os.path.basename(d_view)
                if fname in downloaded_files_set:
                    valid_drone_views.append(d_view)
                    valid_remote_urls.append(r_url)
            
            if valid_drone_views:
                clean_locations.append({
                    "id": loc["id"],
                    "name": loc["name"],
                    "droneViews": valid_drone_views,
                    "remoteUrls": valid_remote_urls
                })
        
        # Verify map overview image
        map_filename = f"{map_id}{os.path.splitext(m['remoteMapUrl'])[1]}"
        map_src = f"/images/maps/{map_id}/{map_filename}"
        if not os.path.exists(os.path.join(workspace_root, "public", "images", "maps", map_id, map_filename)):
            # fallback to legacy if exists
            map_src = m["src"]
            
        formatted_db[map_id] = {
            "id": m["id"],
            "name": m["name"],
            "src": map_src,
            "remoteMapUrl": m["remoteMapUrl"],
            "locations": clean_locations
        }
    
    # Save to public/data/maps.json
    os.makedirs(os.path.join(workspace_root, "public", "data"), exist_ok=True)
    json_path = os.path.join(workspace_root, "public", "data", "maps.json")
    with open(json_path, "w") as f:
        json.dump(formatted_db, f, indent=2)
    print(f"Saved: {json_path}")
    
    # Save to lib/mapData.ts
    ts_path = os.path.join(workspace_root, "lib", "mapData.ts")
    ts_content = """export interface MapLocation {
  id: string;
  name: string;
  droneViews: string[];
  remoteUrls?: string[];
}

export interface MapData {
  id: string;
  name: string;
  src: string;
  remoteMapUrl?: string;
  locations?: MapLocation[];
}

export const MAPS_DATABASE: Record<string, MapData> = """ + json.dumps(formatted_db, indent=2) + """;
"""
    with open(ts_path, "w") as f:
        f.write(ts_content)
    print(f"Saved: {ts_path}")
