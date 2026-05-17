// As apps VPN estao agora guardadas na base de dados (tabela 'apps').
// Geridas em /admin/apps
// Este ficheiro foi mantido para compatibilidade com outros modulos que possam importar tipos.
export type AppInfo = {
  id: string;
  name: string;
  icon: string;
  desc: string;
};
