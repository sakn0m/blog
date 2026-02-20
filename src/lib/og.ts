import satori from 'satori';
import sharp from 'sharp';
import { getCharterFont } from './og-font';

export async function renderOgImage(
  title: string,
  subtitle: string,
  options: { isHomepage?: boolean } = {}
): Promise<Buffer> {
  const fontData = await getCharterFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#fafafa',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: options.isHomepage ? 64 : 56,
                fontWeight: 500,
                color: '#171717',
                lineHeight: 1.1,
              },
              children: title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: options.isHomepage ? 28 : 24,
                color: '#a3a3a3',
                marginTop: 24,
                fontStyle: options.isHomepage ? 'normal' : 'italic'
              },
              children: subtitle,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Charter',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
