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