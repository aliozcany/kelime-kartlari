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
| `App.js` | Alt sekmeler (Çalış / Ekle / Kelimelerim), Yedek düğmesi; kartları ve konuları yükler, kaydeder |
| `src/screens/StudyScreen.js` | Bugünün kartları, çevirme animasyonu, ipucu, Bildim/Bilemedim |
| `src/screens/AddScreen.js` | Yeni kart ekleme ekranı |
| `src/screens/ListScreen.js` | Kelimeleri güne / haftaya / aya göre gruplu liste, düzenleme ve silme |
| `src/components/CardForm.js` | Ekleme ve düzenlemede ortak form: tekrar eden kelime uyarısı, referans, konu seçimi |
| `src/components/BackupSheet.js` | Yedek alma (paylaş) ve geri yükleme (yapıştır) penceresi |
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
- Aralıkları değiştirmek için `src/dates.js` içindeki `INTERVALS` ve `STAGE_LABELS` dizilerini düzenle.

## Kartlar

- Her kartta İngilizce ve Türkçe zorunlu. Örnek cümle, **nerede gördün** (referans) ve **konu** isteğe bağlı.
- Aynı İngilizce kelime zaten varsa form uyarır, düğme "Yine de ekle" olur (farklı anlamlar için).
- Konular formdaki "+ Konu" ile eklenir, konuya uzun basarak silinir. Silinen konu kartlardan kaldırılır, kartlar silinmez.
- Bir kart eklenince konu ve referans alanları boş kalmaz, sonraki kelime için seçili kalır.
- Kelimelerim ekranında karta dokunursan örnek cümle, referans ve tekrar ilerlemesi açılır. Buradan **Düzenle** / **Sil** yapılabilir (uzun basmak da siler). Düzenleme tekrar planını bozmaz.

## Yedek

Sağ üstteki **💾 Yedek** düğmesi:
- **Yedeği paylaş**: Tüm kartlar ve konular tek bir metin olarak paylaş menüsüne gider. Notlar'a, e-postaya, WhatsApp'a vb. kaydedebilirsin.
- **Geri yükle**: Bu metni yapıştırırsan mevcut veriler silinir, yerine yedektekiler yüklenir.
