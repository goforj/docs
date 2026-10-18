package benchmarks

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// benchmarkRecord makes the same primary-key lookup return the same fields on each backend.
type benchmarkRecord struct {
	ID      int64  `gorm:"primaryKey;autoIncrement:false"`
	Name    string `gorm:"size:64;not null"`
	Payload string `gorm:"size:256;not null"`
}

// BenchmarkDatabaseRead measures warmed GORM primary-key reads using GoForj's database defaults.
// This is a database-operation fixture, not a generated application's complete request path.
func BenchmarkDatabaseRead(b *testing.B) {
	for _, name := range []string{"mysql", "postgres", "sqlite"} {
		b.Run(name, func(b *testing.B) {
			var dialector gorm.Dialector
			switch name {
			case "mysql":
				dsn := os.Getenv("FORJ_BENCH_MYSQL_DSN")
				if dsn == "" {
					b.Fatal("FORJ_BENCH_MYSQL_DSN is required")
				}
				dialector = mysql.Open(dsn)
			case "postgres":
				dsn := os.Getenv("FORJ_BENCH_POSTGRES_DSN")
				if dsn == "" {
					b.Fatal("FORJ_BENCH_POSTGRES_DSN is required")
				}
				dialector = postgres.Open(dsn)
			case "sqlite":
				dialector = sqlite.Open(filepath.Join(b.TempDir(), "bench.db"))
			}
			database, err := gorm.Open(dialector, &gorm.Config{
				SkipDefaultTransaction:                   true,
				DisableForeignKeyConstraintWhenMigrating: true,
				DisableAutomaticPing:                     false,
				FullSaveAssociations:                     false,
				Logger:                                   logger.Default.LogMode(logger.Silent),
				NowFunc:                                  func() time.Time { return time.Now().UTC() },
			})
			if err != nil {
				b.Fatal(err)
			}
			pool, err := database.DB()
			if err != nil {
				b.Fatal(err)
			}
			pool.SetMaxOpenConns(1)
			pool.SetMaxIdleConns(1)
			b.Cleanup(func() {
				if err := pool.Close(); err != nil {
					b.Error(err)
				}
			})
			if err := database.AutoMigrate(&benchmarkRecord{}); err != nil {
				b.Fatal(err)
			}
			if err := database.Where("1 = 1").Delete(&benchmarkRecord{}).Error; err != nil {
				b.Fatal(err)
			}
			records := make([]benchmarkRecord, 1000)
			for i := range records {
				records[i] = benchmarkRecord{ID: int64(i + 1), Name: fmt.Sprintf("user-%04d", i+1), Payload: "A fixed database benchmark payload."}
			}
			if err := database.CreateInBatches(records, 100).Error; err != nil {
				b.Fatal(err)
			}
			var warm benchmarkRecord
			if err := database.First(&warm, 1).Error; err != nil {
				b.Fatal(err)
			}
			iteration := int64(0)
			b.ReportAllocs()
			for b.Loop() {
				id := iteration%1000 + 1
				var record benchmarkRecord
				if err := database.First(&record, id).Error; err != nil {
					b.Fatal(err)
				}
				if record.ID != id {
					b.Fatalf("wrong record: got %d, want %d", record.ID, id)
				}
				iteration++
			}
		})
	}
}
