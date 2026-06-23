import satori from 'satori';
import sharp from 'sharp';
import { getCharterRegular, getMonoFont } from './og-font';

export async function renderOgImage(
  title: string,
  subtitle: string,
  options: { isHomepage?: boolean } = {}
): Promise<Buffer> {
  const charterData = await getCharterRegular();
  const monoData = getMonoFont();

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
                fontFamily: 'Hack',
                fontWeight: 400,
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
          data: charterData,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Charter',
          data: charterData,
          weight: 700,
          style: 'normal',
        },
        {
          name: 'Hack',
          data: monoData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
