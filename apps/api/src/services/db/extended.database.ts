import { DataBaseType } from "./database.provider";

export class ExtendedDatabase {
    // Add index signature to allow dynamic property access
    [key: string]: any;
    
    constructor(private readonly db: DataBaseType) {
        // Copy all properties and methods from db to this instance
        const dbKeys = Object.getOwnPropertyNames(Object.getPrototypeOf(db));
        const dbInstanceKeys = Object.keys(db as any);
        
        // Copy methods
        for (const key of dbKeys) {
            if (key !== 'constructor' && typeof (db as any)[key] === 'function') {
                this[key] = (db as any)[key].bind(db);
            }
        }
        
        // Copy properties
        for (const key of dbInstanceKeys) {
            if (this[key] === undefined) {
                this[key] = (db as any)[key];
            }
        }
    }

    async get() {
        return this.db;
    }

    toStream(){
        
        this.db
    }
}
