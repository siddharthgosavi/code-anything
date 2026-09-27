# code-anything brand assets generator (BRAND-3)
from PIL import Image, ImageDraw, ImageFont
import math

# Brand system: Deep Space Indigo + Prism Teal accent (ownable, distinct from
# the generic-blue "everything-*" family).
BG      = (17, 18, 38)       # #111226
PANEL   = (28, 30, 58)
INK     = (240, 243, 255)
TEAL    = (45, 212, 191)     # #2DD4BF accent
VIOLET  = (129, 103, 255)
PINK    = (255, 107, 181)
DIM     = (120, 126, 168)

F = "/usr/share/fonts/google-noto/NotoSans-Bold.ttf"
FR = "/usr/share/fonts/google-noto/NotoSans-Regular.ttf"
def font(sz, bold=True): return ImageFont.truetype(F if bold else FR, sz)

def rounded(d, box, r, fill): d.rounded_rectangle(box, radius=r, fill=fill)

# ---- Icon: a prism/chevron "spark" = "any code, any stack" ----
def icon(size, pad):
    im = Image.new("RGBA", (size, size), (0,0,0,0)); d = ImageDraw.Draw(im)
    cx, cy = size/2, size/2
    s = size - pad*2
    # rounded tile
    rounded(d, [pad, pad, size-pad, size-pad], s*0.22, PANEL)
    d.rounded_rectangle([pad, pad, size-pad, size-pad], radius=s*0.22, outline=(60,64,110), width=max(2,size//96))
    # terminal chevron '<'
    lw = size*0.075
    ch = s*0.30; cw = s*0.20; y0 = cy - ch/2
    d.line([(cx-s*0.02, y0),(cx-cw, cy),(cx-s*0.02, y0+ch)], fill=TEAL, width=int(lw), joint="curve")
    # prism spark '*' to the right = "anything"
    r = s*0.13; sx = cx + s*0.20
    for k,ang in enumerate(range(-90, 91, 60)):
        a = math.radians(ang)
        col = [TEAL, VIOLET, PINK][k%3]
        d.line([(sx - r*math.cos(a), cy - r*math.sin(a)),(sx + r*math.cos(a), cy + r*math.sin(a))], fill=col, width=int(lw*0.8),)
    d.ellipse([sx-lw*0.5, cy-lw*0.5, sx+lw*0.5, cy+lw*0.5], fill=INK)
    return im

for sz,name in [(1024,"icon-1024.png"),(512,"icon-512.png"),(180,"icon-180.png"),(64,"icon-64.png")]:
    icon(sz, sz*0.10).save(f"assets/logo/{name}")

# ---- Wordmark (transparent) ----
def wordmark(w,h):
    im = Image.new("RGBA",(w,h),(0,0,0,0)); d=ImageDraw.Draw(im)
    isz=int(h*0.74); ic=icon(isz,int(h*0.08)); im.paste(ic,(0,int((h-isz)/2)),ic)
    f=font(int(h*0.40)); x=isz+int(h*0.16)
    d.text((x, h*0.5), "code", font=f, fill=INK, anchor="lm")
    cw=d.textlength("code",font=f)
    d.text((x+cw, h*0.5), "-anything", font=f, fill=TEAL, anchor="lm")
    return im
wordmark(1400,360).save("assets/logo/wordmark.png")

# ---- GitHub header / OG (1200x630) ----
def header():
    W,H=1280,640; im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    # subtle prism gradient bands on right
    for i,(col) in enumerate([(VIOLET,90),(PINK,60),(TEAL,140)]):
        c,a=col; d.rounded_rectangle([W-360+i*40, -80, W+i*40, H+80], radius=60, fill=(BG[0]+ (c[0]-BG[0])//6, BG[1]+(c[1]-BG[1])//6, BG[2]+(c[2]-BG[2])//6))
    for x in range(0,W,26):  d.line([(x,H),(x-140,H+140)], fill=(24,26,50), width=1)
    d.rectangle([0,0,W,H], outline=(40,44,80), width=2)
    ic=icon(150,15); im.paste(ic,(72,66),ic)
    f=font(74)
    d.text((248,96),"code",font=f,fill=INK)
    d.text((248+d.textlength("code",font=f),96),"-anything",font=f,fill=TEAL)
    d.text((248,196),"The agent ops layer for AI coding CLIs.",font=font(40,False),fill=INK)
    d.text((72,300),"Session-safe setup   ·   Zero-token code intelligence   ·   Measured agent routing",font=font(30,False),fill=DIM)
    # stat chips
    chips=[("10","subagents"),("14","slash commands"),("279","specialists"),("0","runtime deps")]
    bx=72
    for big,label in chips:
        w=210; rounded(d,[bx,H-150,bx+w,H-72],14,PANEL)
        d.text((bx+18,H-138),big,font=font(46),fill=TEAL)
        d.text((bx+18,H-84),label,font=font(22,False),fill=DIM)
        bx+=w+20
    d.text((W-72,H-52),"npx code-anything",font=font(28,False),fill=TEAL,anchor="rm")
    return im
header().save("assets/og.png")
print("brand assets generated")
