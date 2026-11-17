# Kelime Kartları

Kendi eklediğin İngilizce–Türkçe kelimeleri 1. gün, 3. gün, 1. hafta, 2. hafta ve 1. ayda tekrar ettiren basit bir React Native (Expo) uygulaması.

## Kurulum

```bash
npm install
```

### Telefona APK olarak kurmak (Android)

```bash
npx eas-cli login
npx eas-cli build -p android --profile apk
```

Derleme Expo'nun sunucusunda yapılır. Bitince verilen linki telefondan açıp APK'yı indir ve kur. Kodu değiştirince ikinci komutu tekrar çalıştırıp yeni APK'yı üstüne kur; kartlar silinmez.

### Geliştirirken denemek

```bash
npx expo start
```

Telefondaki **Expo Go** ile QR kodu okut (bilgisayar açık ve aynı Wi-Fi'de olmalı).

## Dosyalar

| Dosya | Ne yapar |
|---|---|
| `App.js` | Alt sekmeler (Çalış / Ekle / Kelimelerim / Haznem), Yedek düğmesi; kartları ve konuları yükler, kaydeder |
| `src/screens/StudyScreen.js` | Bugünün kartları, çevirme animasyonu, ipucu, Bildim/Bilemedim |
| `src/screens/AddScreen.js` | Yeni kart ekleme ekranı |
| `src/screens/ListScreen.js` | Arama; kelimeleri güne / haftaya / aya göre gruplu liste ya da takvim; düzenleme ve silme |
| `src/screens/VaultScreen.js` | Kelime Haznem: 5/5 tamamlanan kelimeler ve karıştırılmış test |
| `src/components/FlipCard.js` | Çevrilebilir kart (Çalış ve Haznem testi ortak kullanır) |
| `src/components/EditCardSheet.js` | Kart düzenleme penceresi |
| `src/components/CalendarView.js` | Ay takvimi, her günde eklenen kelime sayısı (+N) |
| `src/components/CardForm.js` | Ekleme ve düzenlemede ortak form: tekrar eden kelime uyarısı, referans, konu seçimi |
| `src/components/BackupSheet.js` | Yedeği .json dosyası olarak kaydetme ve dosyadan geri yükleme |
| `src/components/Sheet.js` | Alttan açılan pencere |
| `src/backup.js` | Yedek metnini oluşturma ve doğrulama |
| `src/dates.js` | Tarih yardımcıları ve tekrar aralıkları (`INTERVALS`) |
| `src/srs.js` | Tekrar mantığı |
| `src/storage.js` | Telefonda kalıcı kayıt (AsyncStorage) |
| `src/theme.js` | Renkler |

## Tekrar mantığı

- Kelime eklendiği gün sorulmaz; ertesi gün "Çalış" ekranına düşer.
- **Bildim** → bir sonraki tekrar aşamasına geçer (1. gün → 3. gün → 1. hafta → 2. hafta → 1. ay → tamamlandı).
- **Bilemedim** → kart sıfırlanır, plan o günden baştan başlar: ertesi gün, 3. gün, 1. hafta, 2. hafta, 1. ay. Aynı gün tekrar sorulmaz.
- Bir gün girmezsen kartlar kaybolmaz, "Gecikti" olarak bekler. Birkaç aşama birden kaçtıysa, tarihi geçmiş aşamalar atlanır ki aynı kelime aynı gün iki kez gelmesin.
- 5/5 tekrarı biten kelime günlük çalışmaya bir daha gelmez, **Haznem** sekmesine geçer. Orada "Teste başla" ile tüm haznedeki kelimeler karışık sırada kart kart gelir. Test tekrar planını değiştirmez; sonunda bilemediklerini istersen tekrar planına alabilirsin.
- Aralıkları değiştirmek için `src/dates.js` içindeki `INTERVALS` ve `STAGE_LABELS` dizilerini düzenle.

## Kartlar

- Her kartta İngilizce ve Türkçe zorunlu. **Tür** (noun / verb / adj / adv / phrase), örnek cümle, **eş ve zıt anlamlılar**, **nerede gördün** (referans) ve **konu** isteğe bağlı.
- Bir kelimenin kaç kez bilinemediği (günlük tekrar + Haznem testleri) listede ✗ rozetiyle ve kartın arkasında görünür.
- Çalışırken kart çevrilince sağ üstte **✏️ Düzenle** çıkar.
- Aynı İngilizce kelime zaten varsa form uyarır, düğme "Yine de ekle" olur (farklı anlamlar için).
- Konular formdaki "+ Konu" ile eklenir, konuya uzun basarak silinir. Silinen konu kartlardan kaldırılır, kartlar silinmez.
- Bir kart eklenince konu ve referans alanları boş kalmaz, sonraki kelime için seçili kalır.
- Kelimelerim ekranının üstündeki arama kutusu İngilizce, Türkçe, örnek cümle, eş/zıt anlam, referans ve konuda arar (büyük/küçük harf ve ı/i, ö/o farkı gözetmez).
- **Takvim** sekmesinde her günün altında o gün eklenen kelime sayısı (+N) yazar; güne dokununca o günün kelimeleri açılır.
- Kelimelerim ekranında karta dokunursan örnek cümle, referans ve tekrar ilerlemesi açılır. Buradan **Düzenle** / **Sil** yapılabilir (uzun basmak da siler). Düzenleme tekrar planını bozmaz.

## Yedek

Sağ üstteki **💾 Yedek** düğmesi:
- **Yedek dosyasını kaydet**: Tüm kartlar ve konular `kelime-kartlari-YYYY-MM-DD.json` dosyası olarak paylaş menüsüne gider. Drive'a, Dosyalar'a, e-postaya, WhatsApp'a kaydedebilirsin.
- **Yedek dosyası seç**: Bu dosyayı seçersen mevcut veriler silinir, yerine yedektekiler yüklenir.
- Eski metin yedekleri için "metni yapıştır" seçeneği hâlâ duruyor.
