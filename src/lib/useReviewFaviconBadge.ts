import React from 'react';

export const useReviewFaviconBadge = (reviewAvailable: boolean) => {
  const favicon = React.useRef<Favicon>();
  React.useEffect(() => {
    if (!favicon.current) {
      favicon.current = new Favicon({
        faviconHref: '/favicon.svg',
        link: document.getElementById('favicon') as HTMLLinkElement,
      });
    }

    favicon.current.badge(reviewAvailable);
  }, [reviewAvailable]);
};

interface FaviconOpts {
  faviconHref: string;
  link: HTMLLinkElement;
  size?: number;
}

class Favicon {
  private opts: FaviconOpts;

  public constructor(opts: FaviconOpts) {
    this.opts = opts;
  }

  public badge(badge: boolean) {
    if (!badge) {
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
