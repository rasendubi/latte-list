export interface FaviconOpts {
  faviconHref: string;
  link: HTMLLinkElement;
  size?: number;
}

export class Favicon {
  private opts: FaviconOpts;

  public constructor(opts: FaviconOpts) {
    this.opts = opts;
  }

  public badge(p: any = true) {
    if (!p) {
      this.drawWith(() => {});
    } else {
      this.drawWith((context, size) => {
        const circleSize = size / 6;
        context.beginPath();
        context.arc(size - circleSize, circleSize, circleSize, 0, 2 * Math.PI);
        context.fillStyle = '#ff0000';
        context.fill();
      });
    }
  }

  public drawWith(
    f: (context: CanvasRenderingContext2D, size: number) => void
  ) {
    const { faviconHref, link, size = 64 } = this.opts;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;

    const img = document.createElement('img');
    img.src = faviconHref;

    img.onload = () => {
      context.drawImage(img, 0, 0, size, size);

      f(context, size);

      link.href = canvas.toDataURL('image/png');
      link.type = 'image/png';
    };
  }
}

function getIcons() {
  const icons: HTMLLinkElement[] = [];
  const links = document
    .getElementsByTagName('head')[0]
    .getElementsByTagName('link');
  for (let i = 0; i < links.length; ++i) {
    const link = links[i];
    if (/(^|\s)icon(\s|$)/i.test(link.getAttribute('rel') ?? '')) {
      icons.push(link);
    }
  }

  if (!icons.length) {
    const icon = document.createElement('link');
    icon.setAttribute('rel', 'icon');
    document.getElementsByTagName('head')[0].appendChild(icon);
    icons.push(icon);
  }

  return icons;
}
