using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
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
            var items = await db.FileItems.Where(x => x.Path.Equals(path)).ToListAsync();

            return Json(new {
                items = items.ToList()
            }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<ActionResult> Create(FileItemModel model) {
            if (!ModelState.IsValid) {
                return Json(GetErrors(ModelState));
            }

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
                        System.IO.File.Create(absPath);
                        created = true;
                    }
                }

                if (created) {
                    // add to database
                    db.FileItems.Add(new FileItem {
                        Name = model.Name,
                        MimeType = model.Name.Contains('.') ? model.Name.Split('.').LastOrDefault() : null,
                        Path = model.Path.Trim('/'),
                        IsFolder = model.IsFolder,
                        CDate = DateTime.UtcNow,
                        MDate = DateTime.UtcNow,
                        FileId = model.Path.Count(x => x.Equals('/')) > 1 ? db.FileItems.FirstOrDefault(x => x.Path.Equals(model.Path))?.FileId : null
                    });
                }

                return Json(new {
                    message = await db.SaveChangesAsync() > 0 ? "Successfully Created." : "An Error occured!"
                });
            }
            catch (Exception ex) {
                throw;
            }
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