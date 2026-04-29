export type AppInfo = {
  id: string;
  name: string;
  icon: string;
  desc: string;
};

// Metadados fixos das apps suportadas. Os ficheiros vêm da BD (Supabase).
export const apps: AppInfo[] = [
  {
    id: 'http_injector',
    name: 'HTTP INJECTOR',
    icon: '🚀',
    desc: 'Configurações para HTTP Injector. Importa o ficheiro .ehi directamente na app.',
  },
  {
    id: 'bd_net',
    name: 'BD NET',
    icon: '🌐',
    desc: 'Configurações para BD Net. Ficheiros prontos para importar na aplicação.',
  },
  {
    id: 'apna_tunnel',
    name: 'APNA TUNNEL LITE',
    icon: '⚡',
    desc: 'Configurações para APNA Tunnel Lite. Rápido e fácil de configurar.',
  },
  {
    id: 'maya_tun',
    name: 'MAYA TUN PRO',
    icon: '🌀',
    desc: 'Configurações para Maya Tun Pro. Alta velocidade e estabilidade.',
  },
];
