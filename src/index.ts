import Imgbox from './Imgbox'
import axios from 'axios'
import toFormatArray from './toFormatArray'

const _imgbox = new Imgbox()

const getImagesList = async (list: string[]): Promise<Images[]> => {
  let result = []
  for (const image of list) {
    const response = await axios.get(image, {
      responseType: 'arraybuffer',
    })
    const buffer = response.data
    const filename = response.headers['content-disposition']
      .split('filename="')[1]
      .split('"')[0]
    result.push({ buffer, filename })
  }

  return result
}

interface Result {
  ok: boolean
  gallery_edit?: string
  files?: any[]
  message?: string
}


export async function imgbox(images: Files): Promise<Result> {
  const { code, data } = toFormatArray(images)
  if (!code) throw new Error('Invalid input type')

  const upload = await _imgbox.init()

  let imageList
  switch (code) {
    case 1:
      imageList = await getImagesList(data)
      break
    case 2:
      const listBuffer = await getImagesList(data.map(({ url }) => url))
      imageList = listBuffer.map(({ buffer }, index) => ({
        filename: data[index].filename,
        buffer,
      }))
      break
    case 3:
      imageList = data
      break
  }

  const result = await upload(imageList)
  return result
}
