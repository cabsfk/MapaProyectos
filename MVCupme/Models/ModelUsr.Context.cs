﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MVCupme.Models
{
    using MVCupme.Models;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class CxUsr : DbContext
    {
        public CxUsr()
            : base("name=CxUsr")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<MUB_GENERALES> MUB_GENERALES { get; set; }
        public virtual DbSet<MUB_PRIVILEGIOS> MUB_PRIVILEGIOS { get; set; }
        public virtual DbSet<MUB_ROL> MUB_ROL { get; set; }
        public virtual DbSet<MUB_ROL_PRIVILEGIOS> MUB_ROL_PRIVILEGIOS { get; set; }
        public virtual DbSet<MUB_USUARIOS> MUB_USUARIOS { get; set; }
        public virtual DbSet<MUB_GRUPOS> MUB_GRUPOS { get; set; }
        public virtual DbSet<MUB_MODULOS> MUB_MODULOS { get; set; }
        public virtual DbSet<MUB_UNIDADES> MUB_UNIDADES { get; set; }
        public virtual DbSet<MUB_USUARIOS_ROLES> MUB_USUARIOS_ROLES { get; set; }
        public virtual DbSet<MUB_ORGANIZACIONES> MUB_ORGANIZACIONES { get; set; }
    }
}
