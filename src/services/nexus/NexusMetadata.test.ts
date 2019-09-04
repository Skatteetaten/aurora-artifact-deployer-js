import { MetadataService } from './MetadataService';
import { getLastUpdatedTime } from '../../utils/date';

describe('MetadataService', () => {
  describe('generateMetadataFiles', () => {
    it('should create files', () => {
      const metadataService = new MetadataService({
        artifactId: 'deployer',
        groupId: 'no.skatteetaten.aurora',
        lastUpdated: getLastUpdatedTime(new Date('August 26, 2019 20:08:00')),
        packaging: 'tgz',
        version: '1.0.0'
      });

      const files = metadataService.generateMetadataFiles(
        Buffer.from('test'),
        'Webleveransepakke'
      );
      const filesWithStringContent = files.map(file => ({
        ...file,
        content: file.content.toString()
      }));

      expect(filesWithStringContent).toMatchSnapshot();
    });
  });
});
