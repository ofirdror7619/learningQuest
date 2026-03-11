from pathlib import Path
from tempfile import NamedTemporaryFile

from PIL import Image
from rembg import remove


SOURCE_DIR = Path("public/kid")
PATTERN = "kid-*"


def process_image(path: Path) -> tuple[int, int]:
    original = path.read_bytes()
    output = remove(original)

    with NamedTemporaryFile(delete=False, suffix=path.suffix, dir=path.parent) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(output)

    image = Image.open(temp_path).convert("RGBA")
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    transparent_pixels = histogram[0]
    semi_transparent_pixels = sum(histogram[1:255])
    image.save(path)
    temp_path.unlink(missing_ok=True)
    return transparent_pixels, semi_transparent_pixels


def main() -> None:
    files = sorted(path for path in SOURCE_DIR.glob(PATTERN) if path.is_file())
    if not files:
        raise SystemExit("No kid images found.")

    for path in files:
        transparent, semi_transparent = process_image(path)
        print(f"{path.name}: transparent={transparent}, semi_transparent={semi_transparent}")


if __name__ == "__main__":
    main()
