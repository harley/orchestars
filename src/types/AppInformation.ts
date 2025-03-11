export type Social = {
    name: string;
    link: string;
}

export type AppInformation = {
    name: string;
    logo?: {
        id: number;
        url: string;
        alt: string
    };
    description?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
    socials?: Social[];
}