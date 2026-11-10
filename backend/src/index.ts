import { createApp } from './app';
import { config } from './core/config';

createApp().listen(config.port, () => {
  console.log(`Kristy's auction API listening on http://localhost:${config.port}`);
});
