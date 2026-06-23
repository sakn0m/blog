import satori from 'satori';
import sharp from 'sharp';
import { getCharterRegular } from './og-font';

export async function renderOgImage(
  title: string,
  subtitle: string,
  options: { isHomepage?: boolean } = {}
): Promise<Buffer> {
  const fontData = await getCharterRegular();

  const isHome = options.isHomepage;

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
          padding: '80px 80px 60px',
          backgroundColor: '#FDFBF7',
        },
        children: [
          ...(subtitle && !isHome ? [{
            type: 'div',
            props: {
              style: {
                fontSize: 22,
                color: '#8B5E3C',
                marginBottom: 8,
                fontFamily: 'Charter',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.4,
              },
              children: 'jojo.news',
            },
          }] : []),
          {
            type: 'div',
            props: {
              style: {
                fontSize: isHome ? 68 : 52,
                fontWeight: 700,
                color: '#1C1917',
                lineHeight: 1.1,
                fontFamily: 'Charter',
              },
              children: title,
            },
          },
          ...(subtitle ? [{
            type: 'div',
            props: {
              style: {
                fontSize: isHome ? 28 : 24,
                color: '#78716C',
                marginTop: 16,
                fontFamily: 'Charter',
                fontWeight: 400,
                fontStyle: isHome ? 'normal' : 'italic',
                lineHeight: 1.4,
              },
              children: subtitle,
            },
          }] : []),
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
        {
          name: 'Charter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
