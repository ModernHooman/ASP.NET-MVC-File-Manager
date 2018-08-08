# ASP.NET MVC File Manager

A full featured file manager written in c# to create, upload, rename, delete, cut and copy files and folders inside a specific folder. Also **synchronized** with database, which means every file and folder has an unique Id to be used in other entities as **Foreign Key**. The file manager has been written in a separate **Area** which means it can be completely independent from main project.

Here is a screen shot of latest update (`2018/08/08`) :

![A full featured file manager written in c# to create, upload, rename, delete, cut and copy files and folders inside a specific folder.](https://lh3.googleusercontent.com/0Sbuwx3CKjyqGT_liZpjyXAb0yULTkXcApjo5eYMwrzPEZxjPNjVoUZ7MPWu7RLO5NFfBP1lZnSc "ASP.NET MVC File Manager")

**Note :** The project is being developed and there's lots of bugs, thus you should consider it as a **BETA** version.

## Getting Started

To get the File Manager to work follow structures below :

 1. Copy `FileManager` folder to your `Areas` folder inside your project
 2. Change all `namespaces` as your need
 3. Create a folder named `File-Repository` in the **ROOT** of your project and give it required permissions
 4. Add `public DbSet<FileItem> FileItems { get; set; }` to your `DbContext` then run the command `Update-Database -Force` in `Package Manager Console` window
 5. Finally Build the project and enjoy using it

## Contributing

Any contribution to optimize the project or add functionalities is extremely welcomed.

## Authors

- Hooman Limouee - [Hooman-Limouee](https://github.com/hooman-limouee)

See also the list of [contributors](https://github.com/hooman-limouee/ASP.NET-MVC-File-Manager/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/hooman-limouee/ASP.NET-MVC-File-Manager/LICENSE.md) file for details

## Acknowledgments

Special thanks to :

- [Bootstrap](https://github.com/twbs/bootstrap)
- [AlertifyJS](https://github.com/MohammadYounes/AlertifyJS)
- [Font Awesome](https://github.com/FortAwesome/Font-Awesome)
