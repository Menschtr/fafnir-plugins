# Fafnir Eklentileri

[Fafnir](https://github.com/Menschtr/Fafnir-source) için topluluk eklenti
 deposu. Eklentiler, Fafnir sayfasının içinde çalışan ve onu genişleten küçük
JavaScript dosyalarıdır - rozetler, kısayollar, görsel dokunuşlar, mesaj
yardımcıları. Değerlendirme kurulu yok: eklentinizi yapın, klasöre atın ve
sağ alttaki menü butonunun üstündeki **Eklentiler** düğmesinden açın.

> **Güvenlik notu.** Eklentiler, Fafnir'in kendi scriptleriyle aynı yetkilerle
> sayfa içinde çalışır. Yalnızca kaynak kodunu okuduğunuza ve güvendiğinize
> eklentileri etkinleştirin. Her eklenti varsayılan olarak kapalıdır ve
> eklenti bazında, makine bazında açılır.

## Eklenti kurulumu

1. Eklenti klasörünü Fafnir'in eklenti dizinine kopyalayın:

   ```
   %APPDATA%\com.menschtr.fafnir\fafnir\plugins\<eklenti-id>\
   ```

   Klasör adının kendisi eklenti id'sidir (harf, rakam, `.`, `_`, `-`;
   en fazla 64 karakter).

2. Fafnir'i açın, sağ alttaki menü butonunun üstündeki bulmaca parçası
   düğmesine tıklayın ve eklentiyi açın.

3. Eklenti çalışsın diye sayfayı yenileyin (F5).

## Depo yapısı

| Yolu                  | Ne olduğu                                                      |
| --------------------- | -------------------------------------------------------------- |
| `templates/starter/`  | Minimum eklenti iskeleti - yeni eklenti için kopyalayın.       |
| `plugins/demo/`       | Fafnir ile gelen demo eklentisi, referans olarak burada.       |
| `community/`          | Topluluğun eklediği eklentiler, her eklenti bir klasör.        |
| `community/examples/` | Tek bir API'yi gösteren küçük örnekler.                        |
| `tools/validate.js`   | Eklenti klasörünü gerçek kurallara göre doğrulayan araç.       |
| `PLUGIN_API.md`       | Tam API referansı: manifest şeması, `window.Fafnir`, sınırlar. |

## Eklentinizi göndermek

Seçim süreci yok. Eklentiniz doğrulamadan geçiyorsa `community/`'ye aittir.

1. `templates/starter/` klasörünü `community/<eklenti-id>/` olarak kopyalayın
   ve kodunuzu yazın.
2. Doğrulayın:

   ```
   node tools/validate.js community/<eklenti-id>
   ```

3. **PR başına bir eklenti** olacak şekilde pull request açın. Açıklamada
   eklentinin ne yaptığı ve `window.Fafnir` dışına ihtiyacı olan bir yetki
   olup olmadığı yazsın.

Doğrulama, Fafnir'in tarama sırasında zaten uyguladığı kuralları denetler: id
karakterleri, `plugin.json` biçimi, `main` dosyasının klasör içinde bir `.js`
dosyası olması ve boyut sınırları (manifest 64 KB, kaynak 512 KB).

## Belgeler

- [PLUGIN_API.md](PLUGIN_API.md) - manifest şeması, `window.Fafnir` yüzeyi,
  yaşam döngüsü, sınırlar.
- [README.md](README.md) - İngilizce sürüm.

## Lisans

MIT - bkz. [LICENSE](LICENSE). Katkılar aynı lisans altında yapılır.
