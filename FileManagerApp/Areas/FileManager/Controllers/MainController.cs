using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using FileManagerApp.Areas.FileManager.Entities;
using FileManagerApp.Areas.FileManager.Models;
using FileManagerApp.Models;

namespace FileManagerApp.Areas.FileManager.Controllers {
    public class MainController : Controller {
        private readonly ApplicationDbContext db = new ApplicationDbContext();
        private string RootPath = "~/File-Repository/";

        // GET: FileManager/Main
        public ActionResult Index() {
            return View();
        }

        [HttpGet]
        public async Task<ActionResult> Update(string path) {
            path = path.Trim('/');
            // get current files & folders
            var items = db.FileItems.Where(x => x.Path.Equals(path)).Select(x => new FileItemModel {
                Id = x.Id,
                Name = x.Name,
                Path = x.Path,
                MimeType = x.MimeType,
                CDate = x.CDate,
                MDate = x.MDate,
                IsFolder = x.IsFolder
            });

            return Json(new OperationResult {
                Status = OperationStats.Success,
                Items = await items.ToListAsync()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<ActionResult> Create(CreateFileItemModel model) {
            if (!ModelState.IsValid) {
                return Json(new OperationResult {
                    Status = OperationStats.Error,
                    Errors = GetErrors(ModelState)
                });
            }

            model.Path = model.Path.Trim('/');
            var absPath = Server.MapPath(string.Concat(model.Path.Replace("ROOT", RootPath), "/", model.Name));
            var created = false;
            try {
                if (model.IsFolder) {
                    if (!Directory.Exists(absPath)) {
                        Directory.CreateDirectory(absPath);
                        created = true;
                    }
                } else {
                    if (!System.IO.File.Exists(absPath)) {
                        System.IO.File.WriteAllBytes(absPath, new byte[0]);
                        created = true;
                    }
                }

                if (created) {
                    // add to database
                    FileItem newEntity = new FileItem {
                        Name = model.Name,
                        MimeType = model.Name.Contains('.') ? model.Name.Split('.').LastOrDefault() : null,
                        Path = model.Path,
                        IsFolder = model.IsFolder,
                        CDate = DateTime.UtcNow,
                        MDate = DateTime.UtcNow,
                    };

                    if (await db.FileItems.AnyAsync()) {
                        var p = string.Join("/", model.Path.Split('/').Reverse().Skip(1).Reverse().ToArray());
                        FileItem parent = await db.FileItems
                            .FirstOrDefaultAsync(x => x.Path.Equals(p));
                        if (parent != null)
                            newEntity.FileId = parent.Id;
                    }

                    db.FileItems.Add(newEntity);
                }
            } catch (Exception ex) {
                throw;
            }

            if (await db.SaveChangesAsync() > 0) {
                return Json(new OperationResult {
                    Status = OperationStats.Success,
                    Message = StringResources.SuccessfullyCreated
                });
            }

            return Json(new OperationResult {
                Status = OperationStats.Error,
                Message = StringResources.UnknownErrorOccurred
            });
        }

        [HttpPost]
        public async Task<ActionResult> Upload(UploadFileItemModel model) {
            if (!ModelState.IsValid) {
                return Json(new OperationResult {
                    Status = OperationStats.Error,
                    Errors = GetErrors(ModelState)
                });
            }

            model.Path = model.Path.Trim('/');
            List<FileItem> listToAdd = new List<FileItem>();
            FileItem sibling = await db.FileItems.FirstOrDefaultAsync(x => x.Path.Equals(model.Path));

            try {
                var absPath = Server.MapPath(string.Concat(model.Path.Replace("ROOT", RootPath), "/", model.PostedFile.FileName));
                if (System.IO.File.Exists(absPath)) {
                    return Json(new OperationResult {
                        Status = OperationStats.Error,
                        Message = string.Format(StringResources.ItemAlreadyExists, model.PostedFile.FileName)
                    });
                }

                Thread.Sleep(5000);
                model.PostedFile.SaveAs(absPath);
                listToAdd.Add(new FileItem {
                    Name = model.PostedFile.FileName,
                    MimeType = model.PostedFile.ContentType,
                    Path = model.Path.Trim('/'),
                    CDate = DateTime.UtcNow,
                    MDate = DateTime.UtcNow,
                    FileId = sibling?.FileId
                });

                if (!listToAdd.Any())
                    return Json(new OperationResult {
                        Status = OperationStats.Error,
                        Message = StringResources.UnknownErrorOccurred
                    });

                db.FileItems.AddRange(listToAdd);
                await db.SaveChangesAsync();

                return Json(new OperationResult {
                    Status = OperationStats.Success,
                    Message = string.Format(StringResources.SuccessfullyUploaded, model.PostedFile.FileName)
                });
            } catch (Exception ex) {
                throw;
            }
        }

        [HttpGet]
        public async Task<ActionResult> Edit(int id) {
            try {
                FileItem file = await db.FileItems.FindAsync(id);

                if (file == null) {
                    return RedirectToAction("Index");
                }
                string path = Server.MapPath(string.Concat(file.Path.Replace("ROOT", RootPath), file.Name));

                if (!System.IO.File.Exists(path)) {
                    return RedirectToAction("Index");
                }

                var result = new EditFileItemModel {
                    Id = file.Id,
                    Path = file.Path,
                    Name = file.Name,
                    CDate = file.CDate,
                    MDate = file.MDate
                };

                using (StreamReader sr = new StreamReader(path)) {
                    result.Content = await sr.ReadToEndAsync();
                }

                return View(result);
            } catch (Exception ex) {
                throw;
            }
        }

        [HttpPost]
        public async Task<ActionResult> Rename(EditFileItemModel model) {
            try {
                FileItem file = await db.FileItems.FindAsync(model.Id);

                if (file == null) {
                    return Json(new OperationResult {
                        Status = OperationStats.Error,
                        Message = StringResources.NotFoundInDatabase,
                    });
                }

                string absPath = Server.MapPath(string.Concat(file.Path.Replace("ROOT", RootPath), '/', file.Name));
                if (model.IsFolder) {
                    if (!Directory.Exists(absPath)) {
                        return Json(new OperationResult {
                            Status = OperationStats.Error,
                            Message = StringResources.NotFoundInFileSystem,
                        });
                    }
                    // Rename the name of current directory
                    // Rename in File System
                    Directory.Move(absPath, RenameFileOrDirectory(absPath, model.Name));
                    // Rename in Database
                    file.Name = model.Name;
                    file.MDate = DateTime.UtcNow;
                    await db.SaveChangesAsync();

                    // Change sub directory and file pathes
                    await UpdateSubDirectoryPath(await db.FileItems.Where(x => x.FileId != null && x.FileId == file.Id).ToListAsync());
                } else {
                    if (!System.IO.File.Exists(absPath)) {
                        return Json(new OperationResult {
                            Status = OperationStats.Error,
                            Message = StringResources.NotFoundInFileSystem,
                        });
                    }
                    // Rename in File System
                    System.IO.File.Move(absPath, RenameFileOrDirectory(absPath, model.Name));

                    // Rename in Database
                    file.Name = model.Name;
                    file.MDate = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                }

                await db.SaveChangesAsync();

                return Json(new OperationResult {
                    Status = OperationStats.Success,
                    Message = StringResources.NameChanged,
                });
            } catch (Exception ex) {
                throw;
            }
        }

        private async Task UpdateSubDirectoryPath(List<FileItem> files) {
            foreach (var subItem in files) {
                subItem.Path = string.Concat(subItem.File.Path, '/', subItem.File.Name);
                await db.SaveChangesAsync();
                await UpdateSubDirectoryPath(subItem.Files.ToList());
            }
        }

        private string RenameFileOrDirectory(string path, string newName) {
            var dirName = string.Join("\\", path.Split('\\').Reverse().Skip(1).Reverse());

            return string.Concat(dirName, '\\', newName);
        }

        private List<ModelErrorCollection> GetErrors(ModelStateDictionary modelState) {
            return modelState.Select(x => x.Value.Errors)
                .Where(y => y.Count > 0)
                .ToList();
        }

        protected override void Dispose(bool disposing) {
            if (disposing)
                db.Dispose();

            base.Dispose(disposing);
        }
    }
}