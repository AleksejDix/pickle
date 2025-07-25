# Week Start Days Around the World

The question "What day does the week start?" has a surprisingly complex answer that varies by culture, religion, and international standards. This variation creates interesting challenges for developers building international applications.

## The Three Main Conventions

### Monday Start (ISO 8601 Standard)

The International Organization for Standardization (ISO) established Monday as the first day of the week in ISO 8601. This standard is widely adopted for business and technical purposes.

**Countries using Monday start:**

- **Europe**: Nearly all European countries including UK, France, Germany, Italy, Spain, Netherlands, Sweden, Norway, Denmark, Poland, Czech Republic, Hungary, Romania, Greece, and Russia
- **Asia**: China, India, Vietnam, Thailand, Indonesia, Malaysia
- **Oceania**: Australia, New Zealand
- **Africa**: South Africa, Nigeria, Kenya, Egypt (for business)
- **Americas**: Argentina, Chile, Mexico, Peru, Colombia

### Sunday Start

Many countries consider Sunday the first day of the week, often due to religious or cultural traditions.

**Countries using Sunday start:**

- **United States** and **Canada**: This tradition comes from Christian influence where Sunday is the "Lord's Day" - the day of rest and worship
- **Israel**: In Hebrew, Sunday is called "Yom Rishon" (יום ראשון) which literally means "First Day"
- **Brazil** and **Japan**: Following different cultural traditions
- **Philippines**: Due to American colonial influence
- **South Korea**: Despite being geographically in Asia, follows the Sunday-start convention

### Saturday Start

Some Middle Eastern countries begin their week on Saturday, aligning with Islamic work patterns where Friday is the holy day.

**Countries using Saturday start:**

- **Some Middle Eastern countries**: Traditionally included Saudi Arabia, UAE, and other Gulf states
- **Note**: Many have recently shifted to Sunday-start for international business alignment

## Historical Context

### Biblical Origins

The seven-day week originates from the Biblical creation story, where God created the world in six days and rested on the seventh (Sabbath). Different interpretations of which day is the "seventh" led to different week starts.

### Roman Influence

The Romans originally used an eight-day week (nundinae) but adopted the seven-day week around the 1st-2nd century CE. They named days after celestial bodies:

- Dies Solis (Sunday - Sun)
- Dies Lunae (Monday - Moon)
- Dies Martis (Tuesday - Mars)
- Dies Mercurii (Wednesday - Mercury)
- Dies Iovis (Thursday - Jupiter)
- Dies Veneris (Friday - Venus)
- Dies Saturni (Saturday - Saturn)

### Christian Influence

Early Christians distinguished themselves from Jewish traditions by celebrating the "Lord's Day" (Sunday) instead of the Sabbath (Saturday). This influenced Western calendars to show Sunday prominently, often as the first day.

### ISO 8601 Standardization

In 1988, ISO 8601 established Monday as the first day of the week for international standards. This was partly influenced by European business practices and the desire for a secular, standardized system.

## Cultural and Religious Perspectives

### Jewish Tradition

- Week runs from Sunday to Saturday
- Sabbath (Shabbat) is the seventh day (Saturday)
- Days are numbered rather than named (except Sabbath)
- This influenced many Christian calendars to start on Sunday

### Islamic Tradition

- Friday (Jumu'ah) is the holy day for congregational prayers
- Traditional Islamic week ran Saturday to Friday
- Modern practice varies by country
- Many Muslim-majority countries have shifted to align with international business

### Christian Variations

- Catholics and Protestants traditionally view Sunday as the first day
- Some Christian denominations (Seventh-day Adventists) maintain Saturday Sabbath
- Eastern Orthodox churches generally follow local conventions

## Impact on Software Development

### Calendar UI Design

```javascript
// Configuration for different week starts
const WEEK_START_CONFIGS = {
  US: 0, // Sunday
  GB: 1, // Monday (ISO 8601)
  SA: 6, // Saturday (traditional)
  IL: 0, // Sunday
  FR: 1, // Monday
};
```

### Common Implementation Challenges

1. **Date Picker Components**
   - Must be configurable for different week starts
   - Should respect user's locale settings
   - Need clear visual indicators for weekends

2. **Week Number Calculations**
   - ISO week numbers assume Monday start
   - US week numbers often assume Sunday start
   - Can lead to off-by-one errors in calculations

3. **Business Logic**
   - "Next Monday" means different things if week starts on Sunday vs Monday
   - Week-based reporting needs consistent definitions
   - Cross-timezone week calculations become complex

### Best Practices for Developers

1. **Always Make Week Start Configurable**

   ```javascript
   const getWeekStart = (locale) => {
     // Don't hardcode; use locale data or configuration
     return Intl.Locale(locale).weekInfo?.firstDay || 1;
   };
   ```

2. **Use Established Libraries**
   - Libraries like `date-fns`, `moment.js`, or `luxon` handle these complexities
   - Native `Intl.Locale` API provides week information in modern browsers

3. **Clear Documentation**
   - Always document which week start convention your API uses
   - Be explicit about week number calculations
   - Provide examples for different locales

4. **Testing Considerations**
   - Test with multiple locales
   - Verify week number calculations
   - Check edge cases around year boundaries

## Modern Trends

### Business Standardization

Many international companies adopt ISO 8601 (Monday start) regardless of local traditions to maintain consistency across global operations.

### Digital Influence

As software becomes more globalized, there's a trend toward making week start preferences user-configurable rather than locale-dependent.

### Cultural Preservation

Despite standardization pressures, many countries maintain their traditional week starts for cultural and religious reasons, requiring continued flexibility in software design.

## How useTemporal Solves Week Start Confusion

### Configurable Week Start

useTemporal provides a clean, configurable solution to the week start problem:

```javascript
import { createTemporal } from "@usetemporal/core";
import { nativeAdapter } from "@usetemporal/adapter-native";

// Configure week to start on Monday (ISO 8601)
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 1, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
});

// Configure week to start on Sunday (US convention)
const temporalUS = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 0,
});

// Configure week to start on Saturday (Middle East)
const temporalME = createTemporal({
  dateAdapter: nativeAdapter,
  weekStartsOn: 6,
});
```

### Consistent Week Calculations

Once configured, all week-related operations respect your chosen start day:

```javascript
// With Monday start (weekStartsOn: 1)
const year = temporal.periods.year(temporal);
const weeks = temporal.divide(year, "week");

// Each week object automatically uses the configured start day
weeks[0].start; // First Monday of the year
weeks[0].end; // Following Sunday

// Week navigation respects configuration
const currentWeek = temporal.periods.week(temporal);
const nextWeek = currentWeek.future(); // Next Monday to Sunday
```

### Locale-Aware Defaults

useTemporal can automatically detect the appropriate week start based on locale:

```javascript
// Future enhancement (planned)
const temporal = createTemporal({
  dateAdapter: nativeAdapter,
  locale: "en-US", // Would default to Sunday start
});

const temporalEU = createTemporal({
  dateAdapter: nativeAdapter,
  locale: "en-GB", // Would default to Monday start
});
```

### Multi-Calendar Support

Different adapters can handle various calendar systems while maintaining consistent week start behavior:

```javascript
// Using Luxon adapter for better internationalization
import { luxonAdapter } from "@usetemporal/adapter-luxon";

const temporal = createTemporal({
  dateAdapter: luxonAdapter,
  weekStartsOn: 1,
  locale: "ar-SA", // Arabic (Saudi Arabia)
});

// Week calculations work correctly even with different calendar systems
const weeks = temporal.divide(year, "week");
```

### Benefits of useTemporal's Approach

1. **Single Configuration Point**: Set `weekStartsOn` once, applies everywhere
2. **Consistent API**: All week operations use the same configuration
3. **No Ambiguity**: Clear numeric values (0-6) instead of string constants
4. **Adapter Agnostic**: Works the same with any date adapter
5. **Type Safety**: TypeScript ensures only valid values (0-6) are used

### Real-World Example: International Calendar

```javascript
// Calendar component supporting different regions
function createInternationalCalendar(userRegion) {
  const weekStartConfig = {
    US: 0, // Sunday
    EU: 1, // Monday
    IL: 0, // Sunday (Israel)
    SA: 6, // Saturday (Saudi Arabia)
    DEFAULT: 1, // ISO 8601
  };

  const temporal = createTemporal({
    dateAdapter: nativeAdapter,
    weekStartsOn: weekStartConfig[userRegion] ?? weekStartConfig.DEFAULT,
  });

  // Now all calendar operations use the correct week start
  const month = temporal.periods.month(temporal);
  const weeks = temporal.divide(month, "week");

  // Render calendar with proper week layout
  return weeks.map((week) => ({
    start: week.start,
    end: week.end,
    days: temporal.divide(week, "day"),
  }));
}
```

## Conclusion

The question of when a week starts reflects deep cultural, religious, and historical differences across societies. For developers, this means building flexible, configurable systems that respect these differences while maintaining consistency within applications.

useTemporal addresses this challenge head-on with its `weekStartsOn` configuration, ensuring that your date handling respects cultural conventions while maintaining a clean, consistent API. By making week start configuration explicit and applying it uniformly across all operations, useTemporal eliminates a common source of bugs and confusion in international applications.
