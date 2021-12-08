/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * esyoil name type definition
 */
interface Name {
    given: string,
    family: string
}

/**
 * esyoil address type definition
 */
interface Address {
    street: string,
    zipcode: string,
    location: string,
    phone: string,
    mobile: string,
    email: string
}

/**
 * esyoil tank volume information
 */
interface TankVolume {
    max: number,
    limit: number,
    current: number,
    currentPrognistic: number,
    remainingDescription: string,
    yearlyUsage: number,
    useDay: number,
    remainingDays: number,
    remainingUntil: Date,
}

/**
 * Internal class as a base for types.
 */
class TypeBase {

    /**
     * The constructor fills the class with the given data.
     * @param data 
     */
    constructor(data?: any) {
        Object.assign(this, data);
    }
}

/**
 * esyoil information about a logged in user.
 */
export class Me extends TypeBase {
    kid: string | undefined;
    anrede: string | undefined;
    vorname: string | undefined;
    name: string | undefined;
    strasse: string | undefined;
    plz: string | undefined;
    ort: string | undefined;
    tel: string | undefined;
    mobil: string | undefined;
    email: string | undefined;
}

/**
 * esyoil delivery address
 */
export class DeliveryAddress extends TypeBase {
    id: number | undefined;
    honorific: string | undefined;
    default: string | undefined;
    name: Name | undefined;
    address: Address | undefined;
}

/**
 * esyoil tank
 */
export class Tank extends TypeBase {
    id: number | undefined;
    active: boolean | undefined;
    shape: string | undefined;
    volume: TankVolume | undefined;
    height: number | undefined;
    createdAt: Date | undefined;
    yearlyUsage: number | undefined;
    hotWater: number | undefined;

    constructor(data: any) {
        super({});

        this.id = parseInt(`${data.id}`);
        this.active = new Boolean(data.active).valueOf();
        this.shape = data.shape;
        this.height = parseInt(`${data.height}`);
        this.createdAt = new Date(data.createdAt);
        this.yearlyUsage = parseInt(`${data.yearlyUsage}`);
        this.hotWater = parseInt(`${data.hotWater}`);

        this.volume = {
            max: parseInt(`${data.volume.max}`),
            limit: parseInt(`${data.volume.limit}`),
            current: parseInt(`${data.volume.current}`),
            currentPrognistic: parseInt(`${data.volumePrognostic.current}`),
            remainingDescription: data.volume.remainingDescription,
            yearlyUsage: parseInt(`${data.volume.yearlyUsage}`),
            useDay: parseInt(`${data.volume.useDay}`),
            remainingDays: parseInt(`${data.volume.remainingDays}`),
            remainingUntil: new Date(data.volume.remainingUntil),
        }
    }
}

/**
 * esyoil tank sounding event
 */
export class SoundingEvent extends TypeBase {
    id: number | undefined;
    volume: number | undefined;
    height: number | undefined;
    price: number | undefined;
    date: Date | undefined;
    dateRange: Date | undefined;
    heizperiode_1_days_cnt: number | undefined;
    all_days_cnt: number | undefined;
    jahresverbrauch_fiktiv: number | undefined;
    isFilling: boolean | undefined;
    volumeRange: number | undefined;
    useSec: number | undefined;
    useDayAvg: number | undefined;
    useDay: number | undefined;

    constructor(data: any) {
        super({});

        this.id = parseInt(`${data.id}`);
        this.volume = (data.volume ? parseInt(`${data.volume}`) : undefined);
        this.height = (data.height ? parseInt(`${data.height}`) : undefined);
        this.price = (data.price ? parseInt(`${data.price}`) : undefined);
        this.date = new Date(data.date);
        this.heizperiode_1_days_cnt = (data.heizperiode_1_days_cnt ? parseInt(`${data.heizperiode_1_days_cnt}`) : undefined);
        this.all_days_cnt = (data.all_days_cnt ? parseInt(`${data.all_days_cnt}`) : undefined);
        this.jahresverbrauch_fiktiv = (data.jahresverbrauch_fiktiv ? parseFloat(`${data.jahresverbrauch_fiktiv}`) : undefined);
        this.isFilling = (data.isFilling ? new Boolean(data.isFilling).valueOf() : false);
        this.volumeRange = (data.volumeRange ? parseInt(`${data.volumeRange}`) : undefined);
        this.useSec = (data.useSec ? parseInt(`${data.useSec}`) : undefined);
        this.useDayAvg = (data.useDayAvg ? parseFloat(`${data.useDayAvg}`) : undefined);
        this.useDay = (data.useDay ? parseInt(`${data.useDay}`) : undefined);

        if (data.range && data.range.date) {
            this.dateRange = (data.range.date ? new Date(data.range.date) : undefined);
        }
        else {
            this.dateRange = undefined;
        }
    }
}