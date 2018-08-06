using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(FileManagerApp.Startup))]
namespace FileManagerApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
