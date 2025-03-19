/* istanbul ignore file */
// import { LibraryType, PlatformType, TagType } from './models';

export const tagHelper = {
  parseTags: (tags: string[]) => {
    return tags.reduce(
      (tags, tag) => {
        const values = tag.split(':');
        /* istanbul ignore next */
        tags[values[0]] = values.length === 1 ? values[0] : values[1];

        return tags;
      },
      { domain: '', 'app-type': 'microservice', platform: 'any' }
    );
  },
  // setTags: (
  //   domain: string,
  //   platform: PlatformType,
  //   libraryType: LibraryType,
  //   extraTags: Record<string, string> = null
  // ): string => {
  //   let tags = `domain:${domain},platform:${platform},type:${libraryType}`;
  
  //   if (extraTags) {
  //     tags = Object.keys(extraTags).reduce((prev, current) => {
  //       return `${prev},${current}:${extraTags[current]}`;
  //     }, tags);
  //   }
  
  //   return tags;
  // }
};